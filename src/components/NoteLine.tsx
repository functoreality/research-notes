import React, { useMemo, useState } from 'react';
import katex from 'katex';
import type { NoteLine as NoteLineType } from '../types';

interface NoteLineProps {
  line: NoteLineType;
  isExpanded: boolean;
  isVisible: boolean;
  isHighlighted: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  onLinkClick: (marker: string) => void;
  searchHighlights?: [number, number][];
}

function renderLatex(latex: string): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false,
    });
  } catch {
    return latex;
  }
}

const BULLET_SCHEMES = {
  dice: ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅', '①', '②', '③', '④'],
  mahjong: ['🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', '①', '②'],
  circleNumbers: ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'],
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

function getBulletSymbol(indent: number, scheme: keyof typeof BULLET_SCHEMES = 'dots'): string {
  const symbols = BULLET_SCHEMES[scheme];
  return symbols[Math.min(indent, symbols.length - 1)];
}

function getIndentColor(indent: number): string {
  return INDENT_COLORS[Math.min(indent, INDENT_COLORS.length - 1)];
}

function renderContent(
  content: string,
  onLinkClick: (marker: string) => void,
  searchHighlights?: [number, number][]
) {
  const parts: React.ReactNode[] = [];
  const elements: Array<{
    type: 'link' | 'math' | 'code' | 'highlight';
    start: number;
    end: number;
    content: string;
    raw?: string;
  }> = [];

  const linkPattern = /\(\(([_\w]+)\)\)/g;
  const mathPattern = /\$([^\$\n]+?)\$/g;
  const codePattern = /`([^`]+)`/g;

  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    elements.push({
      type: 'link',
      start: match.index,
      end: match.index + match[0].length,
      content: match[1],
      raw: match[0],
    });
  }
  
  while ((match = mathPattern.exec(content)) !== null) {
    const mathContent = match[0].slice(1, -1);
    elements.push({
      type: 'math',
      start: match.index,
      end: match.index + match[0].length,
      content: mathContent,
    });
  }
  
  while ((match = codePattern.exec(content)) !== null) {
    elements.push({
      type: 'code',
      start: match.index,
      end: match.index + match[0].length,
      content: match[1],
    });
  }

  if (searchHighlights) {
    for (const [start, end] of searchHighlights) {
      elements.push({
        type: 'highlight',
        start,
        end,
        content: content.slice(start, end),
      });
    }
  }

  elements.sort((a, b) => a.start - b.start);

  const filteredElements = [];
  let lastEnd = -1;
  for (const el of elements) {
    if (el.start >= lastEnd) {
      filteredElements.push(el);
      lastEnd = el.end;
    }
  }

  let lastIndex = 0;
  filteredElements.forEach((el, key) => {
    if (el.start > lastIndex) {
      parts.push(
        <span key={`text-${key}`}>{content.slice(lastIndex, el.start)}</span>
      );
    }

    switch (el.type) {
      case 'link':
        parts.push(
          <button
            key={`link-${key}`}
            onClick={() => onLinkClick(el.content)}
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
            title={`跳转到 ${el.content}`}
          >
            {el.raw}
          </button>
        );
        break;
      case 'math':
        parts.push(
          <span
            key={`math-${key}`}
            className="inline-block align-middle"
            dangerouslySetInnerHTML={{ __html: renderLatex(el.content) }}
          />
        );
        break;
      case 'code':
        parts.push(
          <code
            key={`code-${key}`}
            className="bg-gray-100 px-1 rounded text-sm font-mono text-pink-600"
          >
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
  });

  if (lastIndex < content.length) {
    parts.push(<span key="text-end">{content.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : content;
}

export function NoteLineComponent({
  line,
  isExpanded,
  isVisible,
  isHighlighted,
  hasChildren,
  onToggle,
  onLinkClick,
  searchHighlights,
}: NoteLineProps) {
  const [bulletScheme] = useState<keyof typeof BULLET_SCHEMES>('dots');

  if (!isVisible) return null;

  const indentPx = line.indent * 24;

  const renderedContent = useMemo(
    () => renderContent(line.content, onLinkClick, searchHighlights),
    [line.content, onLinkClick, searchHighlights]
  );

  if (line.isHeading) {
    const level = Math.min(line.headingLevel, 6);
    const headingSizes: Record<number, string> = {
      1: 'text-2xl font-bold',
      2: 'text-xl font-bold',
      3: 'text-lg font-semibold',
      4: 'text-base font-semibold',
      5: 'text-sm font-semibold',
      6: 'text-sm font-medium',
    };
    const headingClass = headingSizes[level] || 'text-base font-medium';

    const headingContent = (
      <>
        {renderedContent}
        {line.marker && (
          <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1 rounded font-normal">
            {line.marker}
          </span>
        )}
      </>
    );

    return (
      <div
        id={`line-${line.id}`}
        className={`group py-2 px-4 ${isHighlighted ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}`}
      >
        {level === 1 && <h1 className={headingClass}>{headingContent}</h1>}
        {level === 2 && <h2 className={headingClass}>{headingContent}</h2>}
        {level === 3 && <h3 className={headingClass}>{headingContent}</h3>}
        {level === 4 && <h4 className={headingClass}>{headingContent}</h4>}
        {level === 5 && <h5 className={headingClass}>{headingContent}</h5>}
        {level === 6 && <h6 className={headingClass}>{headingContent}</h6>}
      </div>
    );
  }

  if (line.lineType === 'quote') {
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
            ${hasChildren ? 'hover:bg-gray-200 text-gray-400' : 'invisible'}`}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {hasChildren && (
            <span className={`transform transition-transform text-xs ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
          )}
        </button>

        <span className="flex-1 border-l-2 border-gray-300 pl-2 text-gray-600 italic">
          {renderedContent}
          {line.marker && (
            <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1 rounded not-italic">
              {line.marker}
            </span>
          )}
          {hasChildren && !isExpanded && line.descendantCount > 0 && (
            <span className="ml-2 text-xs text-gray-400 not-italic">
              ({line.descendantCount}行)
            </span>
          )}
        </span>

        <span className="flex-shrink-0 text-xs text-gray-300 ml-2 opacity-0 group-hover:opacity-100">
          :{line.lineNum}
        </span>
      </div>
    );
  }

  const bulletSymbol = getBulletSymbol(line.indent, bulletScheme);
  const bulletColor = getIndentColor(line.indent);

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
          ${hasChildren ? 'hover:bg-gray-200' : ''}`}
        aria-label={isExpanded ? 'Collapse' : 'Expand'}
      >
        {hasChildren ? (
          <span className={`transform transition-transform text-xs ${bulletColor} ${isExpanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
        ) : (
          <span className={`text-xs ${bulletColor}`}>{bulletSymbol}</span>
        )}
      </button>

      <span className="flex-1">
        {hasChildren && (
          <span className={`mr-1 ${bulletColor}`}>{bulletSymbol}</span>
        )}
        {renderedContent}
        {line.marker && (
          <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1 rounded">
            {line.marker}
          </span>
        )}
        {hasChildren && !isExpanded && line.descendantCount > 0 && (
          <span className="ml-2 text-xs text-gray-400">
            ({line.descendantCount}行)
          </span>
        )}
      </span>

      <span className="flex-shrink-0 text-xs text-gray-300 ml-2 opacity-0 group-hover:opacity-100">
        :{line.lineNum}
      </span>
    </div>
  );
}
