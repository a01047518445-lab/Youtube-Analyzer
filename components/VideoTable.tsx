
import React from 'react';
import { YouTubeVideo, SortKey, SortOrder, InfluenceLevel } from '../types';

interface VideoTableProps {
  videos: YouTubeVideo[];
  sort: { key: SortKey; order: SortOrder };
  setSort: (s: { key: SortKey; order: SortOrder }) => void;
}

const VideoTable: React.FC<VideoTableProps> = ({ videos, sort, setSort }) => {
  const formatNumber = (num: number) => new Intl.NumberFormat('ko-KR').format(num);

  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleSort = (key: SortKey) => {
    if (sort.key === key) {
      setSort({ key, order: sort.order === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ key, order: 'desc' });
    }
  };

  const getInfluenceBadge = (level: InfluenceLevel) => {
    const base = "px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block w-fit";
    switch (level) {
      case InfluenceLevel.VERY_HIGH: return `${base} bg-red-100 text-red-600`;
      case InfluenceLevel.HIGH: return `${base} bg-orange-100 text-orange-600`;
      case InfluenceLevel.NORMAL: return `${base} bg-yellow-100 text-yellow-600`;
      case InfluenceLevel.LOW: return `${base} bg-green-100 text-green-600`;
      case InfluenceLevel.VERY_LOW: return `${base} bg-blue-100 text-blue-600`;
      default: return base;
    }
  };

  const handleDownloadThumbnail = (e: React.MouseEvent, url: string, title: string) => {
    e.stopPropagation();
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${title.slice(0, 30)}.jpg`;
        link.click();
      });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <th className="px-6 py-4 min-w-[300px]">콘텐츠 정보</th>
              <th className="px-4 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('viewCount')}>
                조회수 {sort.key === 'viewCount' && (sort.order === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('vph')}>
                VPH {sort.key === 'vph' && (sort.order === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('subscriberCount')}>
                구독자 {sort.key === 'subscriberCount' && (sort.order === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('durationSec')}>
                영상시간 {sort.key === 'durationSec' && (sort.order === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('performanceRatio')}>
                성과 및 영향력 {sort.key === 'performanceRatio' && (sort.order === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('publishedAt')}>
                날짜 {sort.key === 'publishedAt' && (sort.order === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {videos.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex gap-4">
                    <div className="relative flex-shrink-0 cursor-pointer" onClick={(e) => handleDownloadThumbnail(e, v.thumbnail, v.title)}>
                      <img src={v.thumbnail} className="w-24 h-16 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded-lg transition-opacity">
                        <span className="text-[10px] text-white font-bold bg-black/60 px-1.5 py-0.5 rounded">SAVE</span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center overflow-hidden">
                      <a 
                        href={`https://youtube.com/watch?v=${v.id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sm font-bold text-slate-800 line-clamp-2 hover:text-red-600 transition-colors leading-tight"
                        title={v.title}
                      >
                        {v.title}
                      </a>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-500 font-medium">{v.channelTitle}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-bold text-slate-700">{formatNumber(v.viewCount)}</td>
                <td className="px-4 py-4 text-sm font-bold text-red-600">{formatNumber(v.vph)}</td>
                <td className="px-4 py-4 text-xs text-slate-500 font-medium">{formatNumber(v.subscriberCount)}</td>
                <td className="px-4 py-4 text-sm font-medium text-slate-700">{formatDuration(v.durationSec)}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span className={getInfluenceBadge(v.influenceLevel)}>{v.influenceLevel}</span>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-800">{(v.performanceRatio * 100).toFixed(1)}%</span>
                      <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${v.performanceRatio > 0.5 ? 'bg-red-500' : 'bg-blue-400'}`} 
                          style={{ width: `${Math.min(100, v.performanceRatio * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-xs text-slate-500">{v.publishedAt.split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {videos.length === 0 && (
        <div className="p-12 text-center text-slate-400">필터링 결과가 없습니다.</div>
      )}
    </div>
  );
};

export default VideoTable;
