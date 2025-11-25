import React from 'react';
import { Message } from '../types';
import { GroundingChip } from './GroundingChip';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex w-full mb-6 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isModel ? 'items-start' : 'items-end'}`}>
        
        {/* Avatar / Name */}
        <div className="flex items-center gap-2 mb-1 px-1">
            {isModel ? (
                <>
                    <div className="w-6 h-6 rounded-full bg-tow-600 flex items-center justify-center shadow-lg shadow-tow-600/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                    </div>
                    <span className="text-xs font-semibold text-tow-500 uppercase tracking-wider">TowPro Dispatch</span>
                    {message.isThinking && (
                        <span className="text-[10px] bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded border border-purple-700/50 flex items-center gap-1">
                           <svg className="animate-pulse" width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                           Thinking
                        </span>
                    )}
                </>
            ) : (
                <span className="text-xs text-slate-400">You</span>
            )}
        </div>

        {/* Bubble */}
        <div 
          className={`px-4 py-3 rounded-2xl shadow-sm leading-relaxed whitespace-pre-wrap ${
            isModel 
              ? 'bg-slate-800/80 border border-slate-700 text-slate-100 rounded-tl-none' 
              : 'bg-tow-600 text-white rounded-tr-none'
          }`}
        >
          {message.text}
        </div>

        {/* Grounding Data (Maps/Search results) */}
        {isModel && message.groundingMetadata?.groundingChunks && message.groundingMetadata.groundingChunks.length > 0 && (
            <div className="mt-3 flex flex-wrap max-w-full">
                {message.groundingMetadata.groundingChunks.map((chunk, idx) => (
                    <GroundingChip key={idx} chunk={chunk} />
                ))}
            </div>
        )}
        
        {/* Timestamp */}
        <span className="text-[10px] text-slate-500 mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

      </div>
    </div>
  );
};
