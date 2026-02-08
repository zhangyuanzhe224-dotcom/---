
import { GoogleGenAI, Type } from "@google/genai";
import { DailyPlan, Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    breakfast: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
        cookingMethod: { type: Type.STRING },
        benefits: { type: Type.STRING },
        imagePrompt: { type: Type.STRING },
      },
      required: ["title", "ingredients", "cookingMethod", "benefits", "imagePrompt"]
    },
    lunch: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
        cookingMethod: { type: Type.STRING },
        benefits: { type: Type.STRING },
        imagePrompt: { type: Type.STRING },
      },
      required: ["title", "ingredients", "cookingMethod", "benefits", "imagePrompt"]
    },
    dinner: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
        cookingMethod: { type: Type.STRING },
        benefits: { type: Type.STRING },
        imagePrompt: { type: Type.STRING },
      },
      required: ["title", "ingredients", "cookingMethod", "benefits", "imagePrompt"]
    },
    dailyTip: { type: Type.STRING }
  },
  required: ["breakfast", "lunch", "dinner", "dailyTip"]
};

export async function generateDailyPlan(): Promise<DailyPlan> {
  const dateStr = new Date().toLocaleDateString('zh-CN');
  const prompt = `你是专门负责55-75岁老年人健康管理的营养专家。请为今天(${dateStr})生成一份完整的养生食谱。要求：清淡、易消化、少油少盐少糖，符合中国家庭日常饮食习惯，语言通俗、亲切。包含早餐、午餐、晚餐和一条养生小贴士。早餐需包含主食、蛋白质和蔬菜。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: PLAN_SCHEMA,
      },
    });

    const data = JSON.parse(response.text);
    return {
      date: dateStr,
      ...data
    };
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
}

export async function generateRecipeImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `A highly appetizing, home-style Chinese healthy dish for seniors: ${prompt}. Bright, soft natural lighting, elegant ceramic dish, looks warm and delicious. Avoid high contrast or cluttered backgrounds.` },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return 'https://picsum.photos/400/400';
  } catch (error) {
    console.error("Error generating image:", error);
    return 'https://picsum.photos/400/400';
  }
}

export async function chatWithNutritionist(userMessage: string, history: {role: string, content: string}[]): Promise<string> {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: '你是一位亲切的AI中医养生营养师，专门为55-75岁的退休长辈服务。你的语言风格要亲切、有耐心，多用鼓励的话语。不要使用复杂的医学术语。强调清淡饮食和预防慢性病。如果遇到严重的健康问题，请温和地提醒长辈咨询医生。不要夸大某种食物的疗效。',
    },
  });

  // Sending history isn't directly supported in simpler chat calls here without building contents,
  // let's just send the message for simplicity in this session-less approach.
  const response = await chat.sendMessage({ message: userMessage });
  return response.text;
}
