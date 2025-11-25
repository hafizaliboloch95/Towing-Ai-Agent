import React from 'react';
import { GroundingChunk } from '../types';

interface GroundingChipProps {
  chunk: GroundingChunk;
}

export const GroundingChip: React.FC<GroundingChipProps> = ({ chunk }) => {
  if (chunk.web) {
    return (
      <a 
        href={chunk.web.uri} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 transition-colors mb-2 mr-2 max-w-full truncate"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-blue-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span className="truncate">{chunk.web.title}</span>
      </a>
    );
  }

  if (chunk.maps) {
    return (
      <a 
        href={chunk.maps.uri} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex flex-col bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 transition-colors mb-2 mr-2 max-w-[200px]"
      >
        <div className="flex items-center gap-2 font-medium text-tow-400 mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span className="truncate">{chunk.maps.title}</span>
        </div>
        {chunk.maps.placeAnswerSources?.reviewSnippets?.[0] && (
           <span className="text-slate-500 italic truncate block w-full">"{chunk.maps.placeAnswerSources.reviewSnippets[0].content}"</span>
        )}
      </a>
    );
  }

  return null;
};
