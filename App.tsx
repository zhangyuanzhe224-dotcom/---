
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
      const dailyPlan = await generateDailyPlan();
      setPlan(dailyPlan);
      
      // Once we have text, trigger image generation
      setIsLoadingImages(true);
      const [bImg, lImg, dImg] = await Promise.all([
        generateRecipeImage(dailyPlan.breakfast.imagePrompt),
        generateRecipeImage(dailyPlan.lunch.imagePrompt),
        generateRecipeImage(dailyPlan.dinner.imagePrompt),
      ]);

      setPlan(prev => prev ? ({
        ...prev,
        breakfast: { ...prev.breakfast, imageUrl: bImg, type: '早餐' },
        lunch: { ...prev.lunch, imageUrl: lImg, type: '午餐' },
        dinner: { ...prev.dinner, imageUrl: dImg, type: '晚餐' },
      }) : null);
      
      setIsLoadingImages(false);
    } catch (err) {
      console.error(err);
      setError("获取今日食谱失败了，请检查网络后再试。");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = new Date();
  const dateFormatted = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍲</span>
            <h1 className="text-2xl font-bold text-green-700">长辈养生管家</h1>
          </div>
          <div className="text-gray-500 font-medium">{dateFormatted}</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 space-y-12">
        {/* Welcome Banner */}
        <section className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-3">爷爷奶奶、叔叔阿姨，早安！</h2>
            <p className="text-xl opacity-90 leading-relaxed max-w-2xl">
              顺应四时，科学饮食。今天我们为您准备了清淡适口、易于消化的养生方案，希望能陪您度过健康愉快的一天。
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] text-9xl opacity-10">🥗</div>
        </section>

        {/* Daily Tip */}
        {plan?.dailyTip && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg flex items-start gap-4 shadow-sm">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-amber-900 font-bold mb-1">今日养生小贴士</p>
              <p className="text-amber-800 text-lg">{plan.dailyTip}</p>
            </div>
          </div>
        )}

        {/* Recipes Grid */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-green-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">今日膳食推荐</h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 text-lg">正在为您精心搭配今日食谱...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 text-xl mb-4">{error}</p>
              <button 
                onClick={fetchPlan}
                className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition-colors"
              >
                重试一下
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {plan && [
                { ...plan.breakfast, type: '早餐' as const }, 
                { ...plan.lunch, type: '午餐' as const }, 
                { ...plan.dinner, type: '晚餐' as const }
              ].map((recipe, idx) => (
                <RecipeCard key={idx} recipe={recipe} isLoadingImage={isLoadingImages} />
              ))}
            </div>
          )}
        </section>

        {/* Nutritionist Chat Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">养生咨询台</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <ChatInterface />
            </div>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🍵</span> 热门话题
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['降压怎么吃', '睡不好吃什么', '燕麦片好吗', '春天养肝', '木耳怎么泡', '少吃盐的妙招'].map((tag) => (
                    <span key={tag} className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 text-base cursor-pointer hover:bg-green-100 hover:text-green-700 transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                <p className="text-green-800 text-base italic">
                  “药补不如食补，食补不如动补。”
                </p>
                <p className="text-green-700 text-sm mt-2 font-bold">— 传统健康箴言</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-10 text-gray-400 text-base">
        <p>© 2024 长辈养生管家 · 您身边的健康饮食助手</p>
        <p className="text-sm mt-1">温馨提示：本网站食谱仅供参考，若有慢性疾病请谨遵医嘱。</p>
      </footer>
    </div>
  );
};

export default App;
