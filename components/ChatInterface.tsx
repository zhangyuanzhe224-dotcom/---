
import React, { useState, useRef, useEffect } from 'react';
import { chatWithNutritionistStream } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '叔叔阿姨好！今天身体感觉怎么样？有什么想吃的或者哪里不舒服，尽管跟我说，我帮您出出主意。' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 创建一个新的占位消息用于存放流式输出
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      let fullResponse = "";
      const stream = chatWithNutritionistStream(input);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = fullResponse;
          return newMsgs;
        });
      }
    } catch (error) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].content = '不好意思，刚才走神了，您能再说一遍吗？';
        return newMsgs;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl flex flex-col h-[650px] border-4 border-green-50 overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-green-600 to-green-500 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-3xl shadow-inner">👩‍⚕️</div>
          <div>
            <h3 className="font-bold text-xl">您的 AI 养生专家</h3>
            <p className="text-sm opacity-80">实时为您提供健康建议</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-700/30 px-3 py-1 rounded-full text-xs">
          <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
          在线咨询中
        </div>
      </div>

      <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-6 bg-[#fdfcf8]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-5 rounded-3xl shadow-sm text-lg leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-green-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none border border-green-100'
            }`}>
              {msg.content || (idx === messages.length - 1 && isTyping ? '正在为您查阅养生方案...' : '')}
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 bg-white border-t border-gray-100 flex gap-3">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="例如：高血压怎么吃？"
          className="flex-grow px-6 py-4 rounded-full bg-gray-50 border-2 border-transparent focus:border-green-400 focus:outline-none text-lg transition-all"
        />
        <button 
          onClick={handleSend}
          disabled={isTyping}
          className={`px-8 py-4 rounded-full font-bold transition-all shadow-lg flex items-center gap-2 ${
            isTyping ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white active:scale-95'
          }`}
        >
          {isTyping ? '思考中' : '发送'}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
