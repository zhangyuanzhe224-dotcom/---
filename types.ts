
export interface Recipe {
  type: '早餐' | '午餐' | '晚餐';
  title: string;
  ingredients: string[];
  cookingMethod: string;
  benefits: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface DailyPlan {
  date: string;
  breakfast: Recipe;
  lunch: Recipe;
  dinner: Recipe;
  dailyTip: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
