
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { DailyPlan, Recipe } from "../types";

// 初始化 AI 客户端
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

/**
 * 核心功能：调取 API 生成每日养生食谱
 */
export async function generateDailyPlan(): Promise<DailyPlan> {
  const dateStr = new Date().toLocaleDateString('zh-CN');
  const prompt = `你是一位拥有30年中医背景的老年健康管理专家。
  请为55-75岁的长辈生成今天的(${dateStr})养生食谱。
  要求：
  1. 早餐：必须包含粗粮主食、优质蛋白（蛋奶豆）和温热蔬菜，强调唤醒肠胃。
  2. 午餐：丰盛但少油盐，适合家庭烹饪，必须有一道深色蔬菜，预防高血压/高血脂。
  3. 晚餐：极简、易消化，强调助眠和减轻肠胃负担。
  4. 语言风格：像邻家女儿一样亲切，用通俗的话解释“养生心法”。
  不要使用“治愈”、“特效”等夸大词汇。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: PLAN_SCHEMA,
      },
    });

    const data = JSON.parse(response.text || "{}");
    return {
      date: dateStr,
      ...data
    };
  } catch (error) {
    console.error("API 调用失败:", error);
    throw error;
  }
}

/**
 * 调取 API 生成菜品图像
 */
export async function generateRecipeImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Chinese home-style healthy cooking, elderly friendly, soft lighting, close-up shot of ${prompt}. The food looks steamed or lightly sautéed, very fresh and natural, served on a warm-colored ceramic plate.` },
        ],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return '';
  } catch (error) {
    console.error("生图 API 失败:", error);
    return '';
  }
}

/**
 * 调取 API 进行流式对话
 */
export async function* chatWithNutritionistStream(userMessage: string) {
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `你是一位亲切的AI中医养生营养师。
      目标人群：55-75岁退休老人。
      原则：
      1. 必须通俗易懂，多用比喻。
      2. 强调少盐少油，预防慢病。
      3. 必须包含中医小知识（如穴位按揉、食疗性质）。
      4. 绝对严禁提供处方药建议。
      5. 语气要像老朋友聊天。`,
    },
  });

  const result = await chat.sendMessageStream({ message: userMessage });
  for await (const chunk of result) {
    const part = chunk as GenerateContentResponse;
    yield part.text || "";
  }
}
