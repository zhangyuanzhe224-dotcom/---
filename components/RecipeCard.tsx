
import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  isLoadingImage: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isLoadingImage }) => {
  const typeColors = {
    '早餐': 'bg-orange-100 text-orange-700',
    '午餐': 'bg-green-100 text-green-700',
    '晚餐': 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden recipe-shadow flex flex-col md:flex-row gap-6 p-4 border border-gray-100 transition-all hover:scale-[1.01]">
      <div className="w-full md:w-1/3 aspect-square rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {isLoadingImage ? (
          <div className="w-full h-full flex items-center justify-center animate-pulse">
            <div className="text-gray-400 text-sm">正在为您准备美味图片...</div>
          </div>
        ) : (
          <img 
            src={recipe.imageUrl || 'https://picsum.photos/400/400'} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      <div className="flex-grow space-y-3">
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1 rounded-full text-base font-bold ${typeColors[recipe.type]}`}>
            {recipe.type}
          </span>
          <h3 className="text-2xl font-bold text-gray-800">{recipe.title}</h3>
        </div>

        <div>
          <h4 className="font-bold text-gray-700 mb-1">【食材清单】</h4>
          <p className="text-gray-600 leading-relaxed">{recipe.ingredients.join('、')}</p>
        </div>

        <div>
          <h4 className="font-bold text-gray-700 mb-1">【做法简述】</h4>
          <p className="text-gray-600 leading-relaxed">{recipe.cookingMethod}</p>
        </div>

        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
          <p className="text-orange-800 text-base leading-relaxed">
            <span className="font-bold">✨ 养生心法：</span>
            {recipe.benefits}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
