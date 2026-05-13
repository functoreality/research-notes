import React, { useEffect, useRef } from 'react';
import { NoteLineComponent } from './NoteLine';
import { useFolding } from '../hooks/useFolding';
import type { NoteFile, GlobalIndex } from '../types';

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
  const globalIndexRef = useRef(globalIndex);
  globalIndexRef.current = globalIndex;
  const onLinkClickRef = useRef(onLinkClick);
  onLinkClickRef.current = onLinkClick;
  
  const {
    lineStates,
    toggleLine,
    expandAll,
    collapseAll
  } = useFolding(file.lines, highlightLine);

  useEffect(() => {
    if (highlightLine !== null && highlightedLineRef.current) {
      highlightedLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightLine]);

  const handleLinkClick = (marker: string) => {
    const target = globalIndexRef.current.markerToFile[marker];
    if (target) {
      onLinkClickRef.current(target.file, target.lineNum);
    }
  };

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
          const state = lineStates[index];
          if (!state) return null;
          
          return (
            <NoteLineComponent
              key={line.id}
              line={line}
              lineState={state}
              isHighlighted={line.lineNum === highlightLine}
              onToggle={() => toggleLine(line.id)}
              onLinkClick={handleLinkClick}
              searchHighlights={searchHighlights?.get(line.id)}
              ref={line.lineNum === highlightLine ? highlightedLineRef : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
