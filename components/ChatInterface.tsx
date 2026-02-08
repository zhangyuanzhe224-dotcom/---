
import React, { useState, useRef, useEffect } from 'react';
import { chatWithNutritionist } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '爷爷奶奶、叔叔阿姨好！我是您的AI养生营养师。关于日常饮食、降压降脂、或是某种菜怎么做更好，您都可以问我。我会尽力给您最实用的建议！' }
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
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatWithNutritionist(input, messages);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '哎呀，网络好像打了个盹，您可以再试一次吗？' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl flex flex-col h-[600px] border border-gray-200">
      <div className="p-4 border-b border-gray-100 bg-green-600 text-white rounded-t-2xl flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 text-2xl">👩‍⚕️</div>
        <div>
          <h3 className="font-bold text-lg">AI 养心营养师</h3>
          <p className="text-xs opacity-90">全天候在线为您解答</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm leading-relaxed text-lg ${
              msg.role === 'user' 
                ? 'bg-green-500 text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl border border-gray-100 text-gray-400 text-sm italic">
              正在思考养生建议...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 flex gap-2 bg-white rounded-b-2xl">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="请输入您想问的问题..."
          className="flex-grow px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-lg"
        />
        <button 
          onClick={handleSend}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold transition-colors shadow-md"
        >
          咨询
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
