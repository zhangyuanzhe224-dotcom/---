
import React, { useState, useEffect, useCallback } from 'react';
import { generateDailyPlan, generateRecipeImage } from './services/geminiService';
import { DailyPlan } from './types';
import RecipeCard from './components/RecipeCard';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. 调用内容生成 API
      const dailyPlan = await generateDailyPlan();
      setPlan(dailyPlan);
      
      // 2. 依次调用生图 API (为了展示动态效果，不使用 Promise.all)
      setIsLoadingImages(true);
      
      const bImg = await generateRecipeImage(dailyPlan.breakfast.imagePrompt);
      setPlan(prev => prev ? ({ ...prev, breakfast: { ...prev.breakfast, imageUrl: bImg, type: '早餐' } }) : null);
      
      const lImg = await generateRecipeImage(dailyPlan.lunch.imagePrompt);
      setPlan(prev => prev ? ({ ...prev, lunch: { ...prev.lunch, imageUrl: lImg, type: '午餐' } }) : null);
      
      const dImg = await generateRecipeImage(dailyPlan.dinner.imagePrompt);
      setPlan(prev => prev ? ({ ...prev, dinner: { ...prev.dinner, imageUrl: dImg, type: '晚餐' } }) : null);
      
      setIsLoadingImages(false);
    } catch (err) {
      console.error(err);
      setError("调取 AI 专家库失败了，可能是网络开小差。");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const today = new Date();
  const dateFormatted = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <div className="min-h-screen pb-20 bg-[#f9faf6]">
      <header className="bg-white border-b border-green-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-green-200">🥗</div>
            <div>
              <h1 className="text-2xl font-black text-green-800 tracking-tight">长辈养生管家</h1>
              <p className="text-xs text-green-600 font-bold uppercase tracking-widest">Powered by Gemini AI</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-gray-400 font-medium">{dateFormatted}</span>
            <button 
              onClick={fetchPlan}
              disabled={isLoading}
              className="flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2 rounded-full font-bold hover:bg-green-100 transition-all border border-green-200 disabled:opacity-50"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
              {isLoading ? '调取中...' : '刷新今日方案'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-10 space-y-12">
        {/* Welcome Banner */}
        <section className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-600 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-sm font-bold">退休生活 · 健康为本</div>
            <h2 className="text-4xl font-bold">叔叔阿姨，今天也要吃得开心！</h2>
            <p className="text-xl opacity-90 leading-relaxed max-w-2xl">
              我们通过 AI 专家系统为您实时定制了今日方案。遵循“早吃好、午吃饱、晚吃少”的古训，结合现代营养学，助您远离三高，神采奕奕。
            </p>
          </div>
          <div className="absolute right-[-40px] bottom-[-40px] text-[15rem] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">🥣</div>
        </section>

        {/* Daily Tip */}
        {plan?.dailyTip && (
          <div className="bg-white p-6 rounded-3xl border-2 border-amber-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">✨</div>
            <div>
              <p className="text-amber-800 font-black text-xl mb-1">今日养生心法</p>
              <p className="text-gray-700 text-lg leading-relaxed">{plan.dailyTip}</p>
            </div>
          </div>
        )}

        {/* Recipes Grid */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-10 bg-green-600 rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-800">AI 定制食谱</h2>
            </div>
            {isLoadingImages && (
              <div className="flex items-center gap-2 text-green-600 animate-pulse font-bold">
                <span>🎨</span> AI 正在为您绘制精美餐图...
              </div>
            )}
          </div>

          {isLoading && !plan ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-green-100 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-green-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-2xl font-bold">正在联络 AI 营养专家...</p>
                <p className="text-gray-400 mt-2">实时分析、科学搭配中</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-10 rounded-3xl text-center border-2 border-red-100">
              <p className="text-red-500 text-2xl font-bold mb-6">{error}</p>
              <button 
                onClick={fetchPlan}
                className="bg-red-500 text-white px-10 py-4 rounded-full font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100"
              >
                再次尝试调取
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {plan && [
                { ...plan.breakfast, type: '早餐' as const }, 
                { ...plan.lunch, type: '午餐' as const }, 
                { ...plan.dinner, type: '晚餐' as const }
              ].map((recipe, idx) => (
                <RecipeCard key={idx} recipe={recipe} isLoadingImage={isLoadingImages && !recipe.imageUrl} />
              ))}
            </div>
          )}
        </section>

        {/* Chat Section */}
        <section className="pt-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-3 h-10 bg-orange-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-800">随时问专家</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <ChatInterface />
            </div>
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative overflow-hidden">
                <h3 className="font-black text-2xl text-gray-800 mb-6 flex items-center gap-3">
                  <span className="bg-orange-100 w-10 h-10 rounded-xl flex items-center justify-center text-xl">💬</span>
                  老人家都在问
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    '高血糖早餐吃什么？',
                    '晚上睡不着，吃什么好？',
                    '每天吃多少盐合适？',
                    '降压操怎么配合饮食？',
                    '五谷杂粮怎么搭配最养胃？'
                  ].map((q) => (
                    <button 
                      key={q}
                      className="text-left p-4 rounded-2xl bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all border border-transparent hover:border-green-200 text-lg"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-8 rounded-[2rem] text-white shadow-xl">
                <p className="text-lg font-bold italic leading-relaxed">
                  “早晨一杯白开水，胜过良药一箩筐。老祖宗的话，咱们得听，也得用现代办法听。”
                </p>
                <div className="mt-6 flex items-center gap-3 text-sm font-bold opacity-80 uppercase tracking-widest">
                  <div className="w-8 h-[2px] bg-white"></div>
                  养生之道
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t border-gray-100 bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-8 mb-6 text-2xl opacity-50">
            <span>🥗</span><span>🍵</span><span>🍲</span><span>🍎</span>
          </div>
          <p className="text-gray-400 font-medium">长辈养生管家 v2.0 · 基于 Gemini AI 技术驱动</p>
          <p className="text-gray-300 text-sm mt-2 max-w-lg mx-auto">
            免责声明：本站提供之食谱均由 AI 专家模型生成，旨在推广健康饮食理念。若您有明确的疾病诊断或正在服药，请务必以您的主治医生建议为准。
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
