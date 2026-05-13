import React, { useEffect, useRef, useCallback } from 'react';
import { NoteLineComponent } from './NoteLine';
import { useFolding } from '../hooks/useFolding';
import type { NoteLine, NoteFile, GlobalIndex } from '../types';

interface FileViewProps {
  file: NoteFile;
  highlightLine: number | null;
  globalIndex: GlobalIndex;
  onLinkClick: (file: string, lineNum: number) => void;
  searchHighlights?: Map<string, [number, number][]>;
}

export function FileView({
  file,
  highlightLine,
  globalIndex,
  onLinkClick,
  searchHighlights
}: FileViewProps) {
  const highlightedLineRef = useRef<HTMLDivElement>(null);
  
  const {
    isLineExpanded,
    toggleLine,
    expandAll,
    collapseAll,
    isLineVisible
  } = useFolding(file.lines, highlightLine);

  useEffect(() => {
    if (highlightLine !== null && highlightedLineRef.current) {
      highlightedLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightLine]);

  const handleLinkClick = useCallback((marker: string) => {
    const target = globalIndex.markerToFile[marker];
    if (target) {
      onLinkClick(target.file, target.lineNum);
    }
  }, [globalIndex, onLinkClick]);

  const handleToggle = useCallback((line: NoteLine) => () => {
    toggleLine(line);
  }, [toggleLine]);

  const hasChildren = useCallback((index: number) => {
    if (index >= file.lines.length - 1) return false;
    return file.lines[index + 1].indent > file.lines[index].indent;
  }, [file.lines]);

  return (
    <div className="font-mono text-sm">
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b sticky top-0 z-10">
        <h2 className="text-lg font-semibold">{file.name}.md</h2>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50"
          >
            展开全部
          </button>
          <button
            onClick={collapseAll}
            className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50"
          >
            折叠全部
          </button>
        </div>
      </div>
      
      <div className="py-2">
        {file.lines.map((line, index) => {
          const isHighlighted = line.lineNum === highlightLine;
          const isVisible = isLineVisible(line, index);
          
          return (
            <div
              key={line.id}
              ref={isHighlighted ? highlightedLineRef : undefined}
            >
              <NoteLineComponent
                line={line}
                index={index}
                isExpanded={isLineExpanded(line)}
                isVisible={isVisible}
                isHighlighted={isHighlighted}
                hasChildren={hasChildren(index)}
                onToggle={handleToggle(line)}
                onLinkClick={handleLinkClick}
                searchHighlights={searchHighlights?.get(line.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
