import React, { useMemo } from 'react';
import type { NoteLine } from '../types';

interface NoteLineProps {
  line: NoteLine;
  index: number;
  isExpanded: boolean;
  isVisible: boolean;
  isHighlighted: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  onLinkClick: (marker: string) => void;
  searchHighlights?: [number, number][];
}

function renderContent(
  content: string, 
  onLinkClick: (marker: string) => void,
  searchHighlights?: [number, number][]
) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  const elements: Array<{ type: 'link' | 'math' | 'code' | 'text' | 'highlight'; start: number; end: number; content: string }> = [];
  
  const linkPattern = /\(\(([_\w]+)\)\)/g;
  const inlineMathPattern = /\$([^\$]+)\$/g;
  const codePattern = /`([^`]+)`/g;
  
  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    elements.push({ type: 'link', start: match.index, end: match.index + match[0].length, content: match[1] });
  }
  while ((match = inlineMathPattern.exec(content)) !== null) {
    elements.push({ type: 'math', start: match.index, end: match.index + match[0].length, content: match[1] });
  }
  while ((match = codePattern.exec(content)) !== null) {
    elements.push({ type: 'code', start: match.index, end: match.index + match[0].length, content: match[1] });
  }
  
  if (searchHighlights) {
    for (const [start, end] of searchHighlights) {
      elements.push({ type: 'highlight', start, end, content: content.slice(start, end) });
    }
  }
  
  elements.sort((a, b) => a.start - b.start);
  
  const mergedElements: typeof elements = [];
  for (const el of elements) {
    if (el.type === 'highlight') {
      let merged = false;
      for (const existing of mergedElements) {
        if (existing.type !== 'link' && existing.type !== 'code' && existing.type !== 'math' &&
            !(el.end <= existing.start || el.start >= existing.end)) {
          existing.start = Math.min(existing.start, el.start);
          existing.end = Math.max(existing.end, el.end);
          merged = true;
          break;
        }
      }
      if (!merged) {
        mergedElements.push(el);
      }
    } else {
      mergedElements.push(el);
    }
  }
  
  mergedElements.sort((a, b) => a.start - b.start);
  
  const key = 0;
  for (const el of mergedElements) {
    if (el.start > lastIndex) {
      parts.push(<span key={`text-${key}`}>{content.slice(lastIndex, el.start)}</span>);
    }
    
    switch (el.type) {
      case 'link':
        parts.push(
          <button
            key={`link-${key}`}
            onClick={() => onLinkClick(el.content)}
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-blue-50 px-0.5 rounded"
          >
            🔗
          </button>
        );
        break;
      case 'math':
        parts.push(
          <code key={`math-${key}`} className="bg-gray-100 px-1 rounded text-sm font-mono">
            ${el.content}$
          </code>
        );
        break;
      case 'code':
        parts.push(
          <code key={`code-${key}`} className="bg-gray-100 px-1 rounded text-sm font-mono text-pink-600">
            {el.content}
          </code>
        );
        break;
      case 'highlight':
        parts.push(
          <mark key={`hl-${key}`} className="bg-yellow-200">
            {content.slice(el.start, el.end)}
          </mark>
        );
        break;
    }
    
    lastIndex = el.end;
  }
  
  if (lastIndex < content.length) {
    parts.push(<span key={`text-end`}>{content.slice(lastIndex)}</span>);
  }
  
  return parts.length > 0 ? parts : content;
}

export function NoteLineComponent({
  line,
  index,
  isExpanded,
  isVisible,
  isHighlighted,
  hasChildren,
  onToggle,
  onLinkClick,
  searchHighlights
}: NoteLineProps) {
  if (!isVisible) return null;
  
  const indentPx = line.indent * 20;
  
  const renderedContent = useMemo(
    () => renderContent(line.content, onLinkClick, searchHighlights),
    [line.content, onLinkClick, searchHighlights]
  );
  
  return (
    <div
      id={`line-${line.id}`}
      className={`group flex items-start py-0.5 px-2 hover:bg-gray-50 ${
        isHighlighted ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''
      }`}
      style={{ paddingLeft: `${indentPx + 8}px` }}
    >
      <button
        onClick={onToggle}
        className={`flex-shrink-0 w-5 h-5 mr-1 rounded flex items-center justify-center
          ${hasChildren ? 'hover:bg-gray-200 text-gray-500' : 'invisible'}`}
        aria-label={isExpanded ? 'Collapse' : 'Expand'}
      >
        {hasChildren && (
          <span className={`transform transition-transform text-xs ${isExpanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
        )}
      </button>
      
      <span className="flex-1">
        {line.isQuote ? (
          <span className="text-gray-500 border-l-2 border-gray-300 pl-2 italic">
            {renderedContent}
          </span>
        ) : (
          <span>
            <span className="text-gray-400 mr-1">•</span>
            {renderedContent}
          </span>
        )}
        
        {line.marker && (
          <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1 rounded">
            {line.marker}
          </span>
        )}
      </span>
      
      <span className="flex-shrink-0 text-xs text-gray-300 ml-2 opacity-0 group-hover:opacity-100">
        :{line.lineNum}
      </span>
    </div>
  );
}
