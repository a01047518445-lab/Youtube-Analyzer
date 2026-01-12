
import React, { useMemo } from 'react';
import { YouTubeVideo } from '../types';

interface KeywordCloudProps {
  videos: YouTubeVideo[];
  onKeywordClick: (keyword: string) => void;
}

const KeywordCloud: React.FC<KeywordCloudProps> = ({ videos, onKeywordClick }) => {
  const keywords = useMemo(() => {
    const scores = new Map<string, number>();
    
    videos.forEach(v => {
      // Tags contribute to score based on frequency and total view weight
      v.tags.forEach(tag => {
        const current = scores.get(tag) || 0;
        scores.set(tag, current + 1 + (v.performanceRatio * 0.5));
      });

      // Also extract words from titles for broader discovery
      const words = v.title.split(/\s+/).filter(w => w.length > 1 && !w.match(/[^\w가-힣]/));
      words.forEach(word => {
        const current = scores.get(word) || 0;
        scores.set(word, current + 0.2);
      });
    });

    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [videos]);

  if (keywords.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"></path></svg>
        AI 기반 연관 키워드 확장
      </h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map(([word, score], idx) => {
          const size = 12 + Math.min(12, score);
          return (
            <button
              key={idx}
              onClick={() => onKeywordClick(word)}
              style={{ fontSize: `${size}px` }}
              className="bg-slate-50 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-full font-semibold text-slate-700 border border-slate-100 transition-all hover:-translate-y-0.5"
            >
              {word}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] text-slate-400 italic">* 태그 빈도수와 영상 성과(Performance Ratio)를 가중 계산한 자동 추천 키워드입니다.</p>
    </div>
  );
};

export default KeywordCloud;
