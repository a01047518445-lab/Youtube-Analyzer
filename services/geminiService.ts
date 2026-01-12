
import { GoogleGenAI } from "@google/genai";
import { YouTubeVideo } from "../types";

export const getAIAnalysis = async (videos: YouTubeVideo[]): Promise<string> => {
  if (videos.length === 0) return "데이터가 없습니다.";
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const topVideosSummary = videos.slice(0, 10).map(v => 
    `- 제목: ${v.title}, 조회수: ${v.viewCount}, VPH: ${v.vph}, 태그: ${v.tags.slice(0,3).join(',')}`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `다음 유튜브 영상 데이터(상위 10개)를 기반으로 현재 트렌드와 시청자들의 반응을 2~3문장으로 요약 분석해주세요. 한국어로 답변해주세요.\n\n${topVideosSummary}`,
      config: {
        systemInstruction: "당신은 전문 유튜브 데이터 분석가입니다. 데이터의 수치적 특징과 트렌드 흐름을 예리하게 분석하여 마케팅 인사이트를 제공합니다.",
        temperature: 0.7,
      }
    });
    return response.text || "분석 결과를 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 분석 중 오류가 발생했습니다.";
  }
};
