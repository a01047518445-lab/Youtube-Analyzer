
import React from 'react';
import { SummaryStats } from '../types';

interface DashboardProps {
  stats: SummaryStats;
  onTagClick: (tag: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, onTagClick }) => {
  const formatNumber = (num: number) => new Intl.NumberFormat('ko-KR').format(num);

  const getPerformanceColor = (ratio: number) => {
    if (ratio > 0.8) return 'text-orange-600';
    if (ratio > 0.3) return 'text-amber-600';
    return 'text-blue-600';
  };

  const totalTypeCount = stats.typeRatio.shorts + stats.typeRatio.mid + stats.typeRatio.long;
  const shortsPercent = totalTypeCount > 0 ? Math.round((stats.typeRatio.shorts / totalTypeCount) * 100) : 0;
  const longPercent = totalTypeCount > 0 ? Math.round((stats.typeRatio.long / totalTypeCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="p-1.5 bg-red-100 text-red-600 rounded-lg">✨</span>
          AI 기반 통계 요약 대시보드
        </h2>
        {stats.aiAnalysis && (
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-full text-xs font-semibold text-slate-500 shadow-sm animate-pulse">
            실시간 AI 트렌드 분석 완료
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Avg Views */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition hover:shadow-md">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">평균 조회수</p>
          <h3 className="text-3xl font-black text-slate-800">{formatNumber(stats.avgViews)}</h3>
          <p className="text-[10px] text-slate-500 mt-2">검색 결과 상위 50개 기준</p>
        </div>

        {/* Avg VPH */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition hover:shadow-md">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">평균 VPH</p>
          <h3 className="text-3xl font-black text-red-600">{formatNumber(stats.avgVph)}</h3>
          <p className="text-[10px] text-slate-500 mt-2">시간당 유입되는 최근 반응 속도</p>
        </div>

        {/* Performance Ratio */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition hover:shadow-md">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">구독자 대비 조회 비율</p>
          <h3 className={`text-3xl font-black ${getPerformanceColor(stats.avgPerformanceRatio)}`}>
            {(stats.avgPerformanceRatio * 100).toFixed(1)}%
          </h3>
          <p className="text-[10px] text-slate-500 mt-2">채널 규모 대비 콘텐츠 파급력</p>
        </div>

        {/* Top Tags */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition hover:shadow-md">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">가장 많이 쓰인 태그</p>
          <div className="flex flex-wrap gap-1">
            {stats.topTags.map((t, idx) => (
              <button 
                key={idx}
                onClick={() => onTagClick(t.tag)}
                className="text-[10px] bg-slate-100 hover:bg-red-50 hover:text-red-600 px-2 py-0.5 rounded font-medium text-slate-600 transition-colors"
              >
                #{t.tag} ({t.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Video Type Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
          <p className="text-sm font-bold text-slate-800 mb-4">영상 유형 비율</p>
          <div className="space-y-4">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs text-slate-500">숏폼 (&lt;3분)</span>
              <span className="text-sm font-bold">{shortsPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${shortsPercent}%` }}></div>
            </div>
            
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs text-slate-500">롱폼 (&gt;20분)</span>
              <span className="text-sm font-bold">{longPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${longPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* AI Analysis Summary */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-xl lg:col-span-2 text-white relative overflow-hidden group">
          <div className="relative z-10 h-full flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
              AI TREND INSIGHT
            </p>
            <p className="text-lg font-medium leading-relaxed italic">
              {stats.aiAnalysis || "데이터를 종합하여 실시간 트렌드를 분석하고 있습니다..."}
            </p>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-red-600 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
