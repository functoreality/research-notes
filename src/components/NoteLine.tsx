import React, { forwardRef } from 'react';
import katex from 'katex';
import type { NoteLine as NoteLineType } from '../types';

interface LineState {
  isExpanded: boolean;
  isVisible: boolean;
  hasChildren: boolean;
}

interface NoteLineProps {
  line: NoteLineType;
  lineState: LineState;
  isHighlighted: boolean;
  onToggle: () => void;
  onLinkClick: (marker: string) => void;
  searchHighlights?: [number, number][];
}

const BULLET_SCHEMES = {
  dots: ['●', '○', '◎', '◉', '◦', '•', '·', '⋅', '∘', '○'],
};

const INDENT_COLORS = [
  'text-blue-500',
  'text-green-500',
  'text-purple-500',
  'text-orange-500',
  'text-pink-500',
  'text-teal-500',
  'text-indigo-500',
  'text-red-500',
  'text-amber-500',
  'text-cyan-500',
];

function renderLatex(latex: string): string {
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode: false });
  } catch {
    return latex;
  }
}

function renderContent(
  content: string,
  onLinkClick: (marker: string) => void,
  searchHighlights?: [number, number][]
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  
  const segments: Array<{ text: string; type: 'text' | 'link' | 'math' | 'code' | 'highlight' }> = [];
  
  const linkPattern = /\(\(([_\w]+)\)\)/g;
  const mathPattern = /\$([^\$\n]+?)\$/g;
  const codePattern = /`([^`]+)`/g;
  
  let match;
  const matches: Array<{ start: number; end: number; type: 'link' | 'math' | 'code'; value: string }> = [];
  
  while ((match = linkPattern.exec(content)) !== null) {
    matches.push({ start: match.index, end: match.index + match[0].length, type: 'link', value: match[0] });
  }
  while ((match = mathPattern.exec(content)) !== null) {
    matches.push({ start: match.index, end: match.index + match[0].length, type: 'math', value: match[0] });
  }
  while ((match = codePattern.exec(content)) !== null) {
    matches.push({ start: match.index, end: match.index + match[0].length, type: 'code', value: match[0] });
  }
  
  if (searchHighlights) {
    for (const [start, end] of searchHighlights) {
      matches.push({ start, end, type: 'link' as const, value: content.slice(start, end) });
    }
  }
  
  matches.sort((a, b) => a.start - b.start);
  
  const filtered: typeof matches = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      filtered.push(m);
      lastEnd = m.end;
    }
  }
  
  let pos = 0;
  let key = 0;
  
  for (const m of filtered) {
    if (m.start > pos) {
      parts.push(<span key={key++}>{content.slice(pos, m.start)}</span>);
    }
    
    if (m.type === 'link') {
      parts.push(
        <button
          key={key++}
          onClick={(e) => { e.stopPropagation(); onLinkClick(m.value.slice(2, -2)); }}
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
        >
          {m.value}
        </button>
      );
    } else if (m.type === 'math') {
      const latex = m.value.slice(1, -1);
      parts.push(
        <span
          key={key++}
          className="inline-block align-middle"
          dangerouslySetInnerHTML={{ __html: renderLatex(latex) }}
        />
      );
    } else if (m.type === 'code') {
      parts.push(
        <code key={key++} className="bg-gray-100 px-1 rounded text-sm font-mono text-pink-600">
          {m.value.slice(1, -1)}
        </code>
      );
    }
    
    pos = m.end;
  }
  
  if (pos < content.length) {
    parts.push(<span key={key++}>{content.slice(pos)}</span>);
  }
  
  return parts.length > 0 ? parts : [content];
}

export const NoteLineComponent = forwardRef<HTMLDivElement, NoteLineProps>(
  function NoteLineComponent({ line, lineState, isHighlighted, onToggle, onLinkClick, searchHighlights }, ref) {
    const { isExpanded, isVisible, hasChildren } = lineState;
    
    if (!isVisible) return null;

    const indentPx = line.indent * 24;
    const bulletSymbol = BULLET_SCHEMES.dots[Math.min(line.indent, 9)];
    const bulletColor = INDENT_COLORS[Math.min(line.indent, 9)];
    const content = renderContent(line.content, onLinkClick, searchHighlights);

    if (line.isHeading) {
      const level = Math.min(line.headingLevel, 6);
      const sizes = ['text-2xl font-bold', 'text-xl font-bold', 'text-lg font-semibold', 'text-base font-semibold', 'text-sm font-semibold', 'text-sm font-medium'];
      
      const headingContent = (
        <>
          {content}
          {line.marker && <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1 rounded font-normal">{line.marker}</span>}
        </>
      );

      return (
        <div ref={ref} id={`line-${line.id}`} className={`group py-2 px-4 ${isHighlighted ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}`}>
          {level === 1 && <h1 className={sizes[0]}>{headingContent}</h1>}
          {level === 2 && <h2 className={sizes[1]}>{headingContent}</h2>}
          {level === 3 && <h3 className={sizes[2]}>{headingContent}</h3>}
          {level === 4 && <h4 className={sizes[3]}>{headingContent}</h4>}
          {level === 5 && <h5 className={sizes[4]}>{headingContent}</h5>}
          {level === 6 && <h6 className={sizes[5]}>{headingContent}</h6>}
        </div>
      );
    }

    if (line.lineType === 'quote') {
      return (
        <div
          ref={ref}
          id={`line-${line.id}`}
          className={`group flex items-start py-0.5 px-2 hover:bg-gray-50 ${isHighlighted ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}`}
          style={{ paddingLeft: `${indentPx + 8}px` }}
        >
          <button onClick={onToggle} className={`flex-shrink-0 w-5 h-5 mr-1 rounded flex items-center justify-center hover:bg-gray-200 ${bulletColor}`}>
            <span className={`transform transition-transform text-xs ${hasChildren && isExpanded ? 'rotate-90' : ''}`}>
              {hasChildren ? '▶' : '•'}
            </span>
          </button>
          <span className="flex-1 border-l-2 border-gray-300 pl-2 text-gray-600 italic">
            {content}
            {line.marker && <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1 rounded not-italic">{line.marker}</span>}
            {hasChildren && !isExpanded && line.descendantCount > 0 && <span className="ml-2 text-xs text-gray-400 not-italic">({line.descendantCount}行)</span>}
          </span>
          <span className="flex-shrink-0 text-xs text-gray-300 ml-2 opacity-0 group-hover:opacity-100">:{line.lineNum}</span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        id={`line-${line.id}`}
        className={`group flex items-start py-0.5 px-2 hover:bg-gray-50 ${isHighlighted ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}`}
        style={{ paddingLeft: `${indentPx + 8}px` }}
      >
        <button onClick={onToggle} className={`flex-shrink-0 w-5 h-5 mr-1 rounded flex items-center justify-center hover:bg-gray-200 ${bulletColor}`}>
          <span className={`transform transition-transform text-xs ${hasChildren && isExpanded ? 'rotate-90' : ''}`}>
            {hasChildren ? '▶' : bulletSymbol}
          </span>
        </button>
        <span className="flex-1">
          {content}
          {line.marker && <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1 rounded">{line.marker}</span>}
          {hasChildren && !isExpanded && line.descendantCount > 0 && <span className="ml-2 text-xs text-gray-400">({line.descendantCount}行)</span>}
        </span>
        <span className="flex-shrink-0 text-xs text-gray-300 ml-2 opacity-0 group-hover:opacity-100">:{line.lineNum}</span>
      </div>
    );
  }
);
