import React from 'react';
import type { BacklinkResult } from '../types';

interface BacklinkPanelProps {
  marker: string;
  results: BacklinkResult[];
  onResultClick: (file: string, lineNum: number) => void;
  onClose: () => void;
}

export function BacklinkPanel({
  marker,
  results,
  onResultClick,
  onClose
}: BacklinkPanelProps) {
  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <span style={{ color: 'var(--color-text-muted)', fontSize: '18px' }}>↩</span>
          <div style={{ 
            flex: 1, 
            fontSize: '16px',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text)'
          }}>
            反链搜索: <span style={{ 
              color: 'var(--color-link)', 
              fontWeight: 500 
            }}>{marker}</span>
          </div>
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
          {results.length > 0 && (
            <div className="search-count">
              找到 {results.length} 个引用
            </div>
          )}
          
          {results.map((result) => (
            <button
              key={`${result.line.file}-${result.line.lineNum}`}
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
                {highlightPattern(result.line.content, result.pattern)}
              </div>
            </button>
          ))}
          
          {results.length === 0 && (
            <div className="search-empty">
              未找到引用此标记的链接
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function highlightPattern(text: string, pattern: string) {
  const linkPattern = `\(\(${pattern}\)\)`;
  const idx = text.indexOf(linkPattern);
  
  if (idx === -1) {
    return text;
  }
  
  return (
    <>
      {text.slice(0, idx)}
      <mark className="search-highlight">{linkPattern}</mark>
      {text.slice(idx + linkPattern.length)}
    </>
  );
}
