
import React, { useState } from 'react';
import { SearchFilters, InfluenceLevel } from '../types';

interface SidebarProps {
  apiKey: string;
  setApiKey: (val: string) => void;
  onSearch: (q: string) => void;
  filters: SearchFilters;
  setFilters: (f: SearchFilters) => void;
  onDownloadCSV: () => void;
  isDataEmpty: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ apiKey, setApiKey, onSearch, filters, setFilters, onDownloadCSV, isDataEmpty }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchClick = () => {
    if (searchInput.trim()) onSearch(searchInput);
  };

  const updateFilters = (key: keyof SearchFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const toggleInfluence = (level: string) => {
    const newInfluence = filters.influence.includes(level)
      ? filters.influence.filter(i => i !== level)
      : [...filters.influence, level];
    updateFilters('influence', newInfluence);
  };

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2">
          <span className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-lg">▶</span>
          <span>YT Analyzer</span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* API Key Section */}
        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Google Cloud API Key</label>
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="API 키를 입력하세요"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
          />
        </section>

        {/* Search Input */}
        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-2">유튜브 검색어</label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
              placeholder="검색 키워드..."
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
            />
            <button 
              onClick={handleSearchClick}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              검색
            </button>
          </div>
        </section>

        {/* Video Type Filter */}
        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-2">영상 유형</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            {['all', 'shorts', 'long'].map((type) => (
              <button
                key={type}
                onClick={() => updateFilters('videoType', type)}
                className={`py-1.5 rounded-md font-medium capitalize transition-all ${
                  filters.videoType === type ? 'bg-white shadow text-red-600' : 'text-slate-500'
                }`}
              >
                {type === 'all' ? '전체' : type === 'shorts' ? '숏폼' : '롱폼'}
              </button>
            ))}
          </div>
        </section>

        {/* Date Filter */}
        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-2">업로드 시기</label>
          <select 
            value={filters.dateRange}
            onChange={(e) => updateFilters('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
          >
            <option value="all">전체 기간</option>
            <option value="7d">최근 7일</option>
            <option value="30d">최근 30일</option>
            <option value="90d">최근 90일</option>
            <option value="custom">사용자 지정</option>
          </select>
          {filters.dateRange === 'custom' && (
            <div className="mt-2 space-y-2">
              <input type="date" className="w-full text-xs border rounded p-1" onChange={(e) => updateFilters('customDateStart', e.target.value)} />
              <input type="date" className="w-full text-xs border rounded p-1" onChange={(e) => updateFilters('customDateEnd', e.target.value)} />
            </div>
          )}
        </section>

        {/* Influence Filter */}
        <section>
          <label className="block text-sm font-semibold text-slate-700 mb-2">영향력 필터</label>
          <div className="space-y-1">
            {Object.values(InfluenceLevel).map((level) => (
              <label key={level} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={filters.influence.includes(level)}
                  onChange={() => toggleInfluence(level)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                  {level}
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50">
        <button 
          onClick={onDownloadCSV}
          disabled={isDataEmpty}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          분석 데이터 다운로드 (CSV)
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
