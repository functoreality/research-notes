import React, { useState, useRef, useEffect } from 'react';
import type { SearchResult } from '../types';

interface SearchPanelProps {
  query: string;
  results: SearchResult[];
  isActive: boolean;
  onQueryChange: (query: string) => void;
  onResultClick: (file: string, lineNum: number) => void;
  onClose: () => void;
}

export function SearchPanel({
  query,
  results,
  isActive,
  onQueryChange,
  onResultClick,
  onClose
}: SearchPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[70vh] flex flex-col">
        <div className="flex items-center p-4 border-b">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="搜索关键词..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={onClose}
            className="ml-2 px-3 py-2 text-gray-500 hover:text-gray-700"
          >
            取消
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {query && (
            <div className="p-4 text-sm text-gray-500">
              找到 {results.length} 个结果
            </div>
          )}
          
          {results.map((result, idx) => (
            <button
              key={result.line.id}
              onClick={() => {
                onResultClick(result.line.file, result.line.lineNum);
                onClose();
              }}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-b-0"
            >
              <div className="text-xs text-gray-400 mb-1">
                {result.line.file}.md :{result.line.lineNum}
              </div>
              <div className="text-sm truncate">
                {highlightText(result.line.content, result.highlights)}
              </div>
            </button>
          ))}
          
          {query && results.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              未找到匹配结果
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function highlightText(text: string, highlights: [number, number][]) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  for (const [start, end] of highlights) {
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
    parts.push(
      <mark key={start} className="bg-yellow-200">{text.slice(start, end)}</mark>
    );
    lastIndex = end;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts;
}
