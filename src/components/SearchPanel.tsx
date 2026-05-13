import React, { useRef, useEffect } from 'react';
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
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <span style={{ color: 'var(--color-text-muted)', fontSize: '18px' }}>⌕</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="搜索关键词..."
            className="search-input"
          />
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'var(--font-display)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-paper-dark)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ESC
          </button>
        </div>
        
        <div className="search-results">
          {query && (
            <div className="search-count">
              找到 {results.length} 个结果
            </div>
          )}
          
          {results.map((result) => (
            <button
              key={result.line.id}
              onClick={() => {
                onResultClick(result.line.file, result.line.lineNum);
                onClose();
              }}
              className="search-result-item"
            >
              <div className="search-result-meta">
                {result.line.file}.md :{result.line.lineNum}
              </div>
              <div className="search-result-content">
                {highlightText(result.line.content, result.highlights)}
              </div>
            </button>
          ))}
          
          {query && results.length === 0 && (
            <div className="search-empty">
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
      <mark key={start} className="search-highlight">
        {text.slice(start, end)}
      </mark>
    );
    lastIndex = end;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts;
}
