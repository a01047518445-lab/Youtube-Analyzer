
import { YouTubeVideo, InfluenceLevel } from '../types';

export const fetchYouTubeData = async (apiKey: string, query: string): Promise<YouTubeVideo[]> => {
  // 1. Search Videos
  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`
  );
  const searchData = await searchRes.json();
  if (searchData.error) throw new Error(searchData.error.message);

  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

  // 2. Get Video Details & Statistics
  const videoRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`
  );
  const videoData = await videoRes.json();
  
  const channelIds = Array.from(new Set(videoData.items.map((v: any) => v.snippet.channelId))).join(',');

  // 3. Get Channel Subscriber Counts
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}&key=${apiKey}`
  );
  const channelData = await channelRes.json();
  
  // FIX: Explicitly type the map to ensure values are treated as numbers, avoiding 'unknown' inference
  const channelStatsMap = new Map<string, number>(
    channelData.items.map((c: any) => [c.id as string, parseInt(c.statistics.subscriberCount) || 0])
  );

  return videoData.items.map((item: any): YouTubeVideo => {
    // FIX: Explicitly type numeric variables to prevent 'unknown' errors in comparisons and math operations
    const views: number = parseInt(item.statistics.viewCount) || 0;
    const subs: number = channelStatsMap.get(item.snippet.channelId) || 0;
    const publishedAt: string = item.snippet.publishedAt;
    const duration: string = item.contentDetails.duration;
    
    // Calculate Duration in Seconds
    const durationSec = parseISO8601Duration(duration);
    
    // Calculate VPH
    const hoursSinceUpload = Math.max(1, (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60));
    const vph = Math.round(views / hoursSinceUpload);

    // Performance Ratio (Views / Subs)
    // FIX: Ensure 'ratio' is a number to resolve potential 'unknown' errors in the subsequent influence level logic
    const ratio: number = subs > 0 ? views / subs : 0;

    let influence = InfluenceLevel.VERY_LOW;
    if (ratio > 1.0) influence = InfluenceLevel.VERY_HIGH;
    else if (ratio > 0.5) influence = InfluenceLevel.HIGH;
    else if (ratio > 0.2) influence = InfluenceLevel.NORMAL;
    else if (ratio > 0.05) influence = InfluenceLevel.LOW;

    return {
      id: item.id,
      thumbnail: item.snippet.thumbnails.high.url,
      title: item.snippet.title,
      description: item.snippet.description,
      tags: item.snippet.tags || [],
      viewCount: views,
      likeCount: parseInt(item.statistics.likeCount) || 0,
      subscriberCount: subs,
      publishedAt,
      duration,
      durationSec,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      vph,
      performanceRatio: ratio,
      influenceLevel: influence
    };
  });
};

const parseISO8601Duration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
};
