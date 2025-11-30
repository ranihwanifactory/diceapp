import { GoogleGenAI } from "@google/genai";
import { DiceValue } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDiceCommentary = async (d1: DiceValue, d2: DiceValue): Promise<string> => {
  try {
    const total = d1 + d2;
    const isDouble = d1 === d2;
    
    const prompt = `
      사용자가 주사위 게임에서 ${d1}과 ${d2}를 던졌습니다. 합계는 ${total}입니다.
      ${isDouble ? "더블(같은 숫자)이 나왔습니다!" : ""}
      
      이 결과에 대해 아주 짧고 재밌는 한 문장 운세나 코멘트를 한국어로 작성해주세요.
      긍정적이고 유쾌한 톤으로 유지하세요. 이모지를 1개 포함하세요.
      존댓말을 사용하세요.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 60,
        temperature: 0.8,
      }
    });

    return response.text?.trim() || "운명이 주사위를 던졌습니다! 🎲";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "오늘의 행운은 당신의 손안에 있습니다! ✨";
  }
};
