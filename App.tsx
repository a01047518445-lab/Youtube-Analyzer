
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { YouTubeVideo, SearchFilters, SummaryStats, SortKey, SortOrder, InfluenceLevel } from './types';
import { fetchYouTubeData } from './services/youtubeService';
import { getAIAnalysis } from './services/geminiService';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VideoTable from './components/VideoTable';
import KeywordCloud from './components/KeywordCloud';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('yt_analysis_key') || '');
  const [query, setQuery] = useState<string>('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');

  const [filters, setFilters] = useState<SearchFilters>({
    videoType: 'all',
    dateRange: 'all',
    influence: []
  });

  const [sort, setSort] = useState<{ key: SortKey; order: SortOrder }>({
    key: 'viewCount',
    order: 'desc'
  });

  useEffect(() => {
    localStorage.setItem('yt_analysis_key', apiKey);
  }, [apiKey]);

  const handleSearch = async (searchQuery: string) => {
    if (!apiKey) {
      setError('유튜브 API 키를 먼저 입력해주세요.');
      return;
    }
    setQuery(searchQuery);
    setLoading(true);
    setError(null);
    setAiSummary('');

    try {
      const data = await fetchYouTubeData(apiKey, searchQuery);
      setVideos(data);
      
      // Request AI analysis separately to not block basic rendering
      const summary = await getAIAnalysis(data);
      setAiSummary(summary);
    } catch (err: any) {
      setError(err.message || '데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // Filter by Video Type
    if (filters.videoType === 'shorts') {
      // 숏폼 기준: 3분(180초) 미만
      result = result.filter(v => v.durationSec < 180);
    } else if (filters.videoType === 'long') {
      result = result.filter(v => v.durationSec >= 1200);
    }

    // Filter by Date
    if (filters.dateRange !== 'all') {
      const now = new Date();
      result = result.filter(v => {
        const pub = new Date(v.publishedAt);
        const diffDays = (now.getTime() - pub.getTime()) / (1000 * 60 * 60 * 24);
        if (filters.dateRange === '7d') return diffDays <= 7;
        if (filters.dateRange === '30d') return diffDays <= 30;
        if (filters.dateRange === '90d') return diffDays <= 90;
        if (filters.dateRange === 'custom' && filters.customDateStart && filters.customDateEnd) {
          const start = new Date(filters.customDateStart);
          const end = new Date(filters.customDateEnd);
          return pub >= start && pub <= end;
        }
        return true;
      });
    }

    // Filter by Influence
    if (filters.influence.length > 0) {
      result = result.filter(v => filters.influence.includes(v.influenceLevel));
    }

    // Sorting
    result.sort((a, b) => {
      const valA = a[sort.key];
      const valB = b[sort.key];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sort.order === 'asc' ? valA - valB : valB - valA;
      }
      return sort.order === 'asc' 
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return result;
  }, [videos, filters, sort]);

  const stats = useMemo((): SummaryStats | null => {
    if (filteredVideos.length === 0) return null;
    
    const totalViews = filteredVideos.reduce((sum, v) => sum + v.viewCount, 0);
    const totalVph = filteredVideos.reduce((sum, v) => sum + v.vph, 0);
    const totalRatio = filteredVideos.reduce((sum, v) => sum + v.performanceRatio, 0);
    
    const tagMap = new Map<string, number>();
    let shorts = 0, mid = 0, long = 0;

    filteredVideos.forEach(v => {
      v.tags.forEach(tag => tagMap.set(tag, (tagMap.get(tag) || 0) + 1));
      // 숏폼 기준: 3분(180초) 미만
      if (v.durationSec < 180) shorts++;
      else if (v.durationSec >= 1200) long++;
      else mid++;
    });

    const topTags = Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      avgViews: Math.round(totalViews / filteredVideos.length),
      avgVph: Math.round(totalVph / filteredVideos.length),
      avgPerformanceRatio: totalRatio / filteredVideos.length,
      topTags,
      typeRatio: { shorts, mid, long },
      aiAnalysis: aiSummary
    };
  }, [filteredVideos, aiSummary]);

  const handleDownloadCSV = () => {
    if (filteredVideos.length === 0) return;

    const headers = ['제목', '채널', '조회수', 'VPH', '구독자', '날짜', '길이', '비율', '영향력', '태그'];
    const rows = filteredVideos.map(v => [
      v.title.replace(/,/g, ' '),
      v.channelTitle.replace(/,/g, ' '),
      v.viewCount,
      v.vph,
      v.subscriberCount,
      v.publishedAt.split('T')[0],
      v.duration,
      v.performanceRatio.toFixed(2),
      v.influenceLevel,
      v.tags.join(';')
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `youtube_analysis_${query}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar 
        apiKey={apiKey} 
        setApiKey={setApiKey} 
        onSearch={handleSearch} 
        filters={filters} 
        setFilters={setFilters}
        onDownloadCSV={handleDownloadCSV}
        isDataEmpty={filteredVideos.length === 0}
      />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-pulse">
              <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium text-lg">실시간 데이터를 분석하는 중입니다...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {!loading && videos.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400">
            <svg className="w-20 h-20 mb-4 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
            <p className="text-xl font-medium">분석할 검색어를 입력하고 검색을 시작하세요.</p>
          </div>
        )}

        {!loading && videos.length > 0 && (
          <>
            {stats && <Dashboard stats={stats} onTagClick={handleSearch} />}
            <KeywordCloud videos={filteredVideos} onKeywordClick={handleSearch} />
            <VideoTable 
              videos={filteredVideos} 
              sort={sort} 
              setSort={setSort} 
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
