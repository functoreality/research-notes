import React, { forwardRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
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
  'var(--indent-0)',
  'var(--indent-1)',
  'var(--indent-2)',
  'var(--indent-3)',
  'var(--indent-4)',
  'var(--indent-5)',
  'var(--indent-6)',
  'var(--indent-7)',
  'var(--indent-8)',
  'var(--indent-9)',
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
          style={{
            color: 'var(--color-link)',
            background: 'none',
            border: 'none',
            padding: 0,
            font: 'inherit',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-link-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-link)'}
        >
          {m.value}
        </button>
      );
    } else if (m.type === 'math') {
      const latex = m.value.slice(1, -1);
      parts.push(
        <span
          key={key++}
          style={{ display: 'inline-block', verticalAlign: 'middle' }}
          dangerouslySetInnerHTML={{ __html: renderLatex(latex) }}
        />
      );
    } else if (m.type === 'code') {
      parts.push(
        <code key={key++} style={{
          fontFamily: 'var(--font-body)',
          backgroundColor: 'var(--color-paper-dark)',
          color: 'var(--color-code)',
          padding: '2px 6px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.9em'
        }}>
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

    const indentPx = line.indent * 16;
    const bulletSymbol = BULLET_SCHEMES.dots[Math.min(line.indent, 9)];
    const bulletColor = INDENT_COLORS[Math.min(line.indent, 9)];
    const content = renderContent(line.content, onLinkClick, searchHighlights);

    if (line.isHeading) {
      const level = Math.min(line.headingLevel, 6);
      const sizes = [
        { fontSize: '1.5rem', fontWeight: 700 },
        { fontSize: '1.25rem', fontWeight: 600 },
        { fontSize: '1.1rem', fontWeight: 600 },
        { fontSize: '1rem', fontWeight: 600 },
        { fontSize: '0.9rem', fontWeight: 600 },
        { fontSize: '0.85rem', fontWeight: 500 }
      ];
      
      const headingContent = (
        <>
          {content}
          {line.marker && <span className="note-marker">{line.marker}</span>}
        </>
      );

      const headingStyle = { 
        ...sizes[level - 1], 
        fontFamily: 'var(--font-display)',
        margin: 0,
        color: 'var(--color-text)'
      };
      
      return (
        <div 
          ref={ref} 
          id={`line-${line.id}`} 
          className={`note-line ${isHighlighted ? 'highlighted' : ''}`}
          style={{ paddingTop: 'var(--space-2)', paddingBottom: 'var(--space-2)' }}
        >
          <span className="note-line-number">{line.lineNum}</span>
          <div style={{ flex: 1 }}>
            {level === 1 && <h1 style={headingStyle}>{headingContent}</h1>}
            {level === 2 && <h2 style={headingStyle}>{headingContent}</h2>}
            {level === 3 && <h3 style={headingStyle}>{headingContent}</h3>}
            {level === 4 && <h4 style={headingStyle}>{headingContent}</h4>}
            {level === 5 && <h5 style={headingStyle}>{headingContent}</h5>}
            {level === 6 && <h6 style={headingStyle}>{headingContent}</h6>}
          </div>
        </div>
      );
    }

    if (line.lineType === 'quote') {
      return (
        <div
          ref={ref}
          id={`line-${line.id}`}
          className={`note-line ${isHighlighted ? 'highlighted' : ''}`}
        >
          <span className="note-line-number">{line.lineNum}</span>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            flex: 1,
            marginLeft: `${indentPx}px`
          }}>
            <button 
              onClick={onToggle} 
              className="note-bullet"
              style={{ color: bulletColor }}
              aria-label={hasChildren ? (isExpanded ? '折叠' : '展开') : undefined}
            >
              <span style={{ 
                transform: hasChildren && isExpanded ? 'rotate(90deg)' : 'none',
                transition: 'transform var(--transition-fast)',
                display: 'inline-block',
                fontSize: '10px'
              }}>
                {hasChildren ? '▶' : '•'}
              </span>
            </button>
            <span style={{ 
              flex: 1, 
              borderLeft: '2px solid var(--color-paper-line)', 
              paddingLeft: 'var(--space-2)', 
              color: 'var(--color-text-muted)',
              fontStyle: 'italic'
            }}>
              {content}
              {line.marker && <span className="note-marker">{line.marker}</span>}
              {hasChildren && !isExpanded && line.descendantCount > 0 && 
                <span className="note-descendants">({line.descendantCount})</span>}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        id={`line-${line.id}`}
        className={`note-line ${isHighlighted ? 'highlighted' : ''}`}
      >
        <span className="note-line-number">{line.lineNum}</span>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          flex: 1,
          marginLeft: `${indentPx}px`
        }}>
          <button 
            onClick={onToggle} 
            className="note-bullet"
            style={{ color: bulletColor }}
            aria-label={hasChildren ? (isExpanded ? '折叠' : '展开') : undefined}
          >
            <span style={{ 
              transform: hasChildren && isExpanded ? 'rotate(90deg)' : 'none',
              transition: 'transform var(--transition-fast)',
              display: 'inline-block',
              fontSize: '10px'
            }}>
              {hasChildren ? '▶' : bulletSymbol}
            </span>
          </button>
          <span className="note-content">
            {content}
            {line.marker && <span className="note-marker">{line.marker}</span>}
            {hasChildren && !isExpanded && line.descendantCount > 0 && 
              <span className="note-descendants">({line.descendantCount})</span>}
          </span>
        </div>
      </div>
    );
  }
);
