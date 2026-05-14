import React, { useEffect, useRef } from 'react';
import { NoteLineComponent } from './NoteLine';
import type { NoteFile, GlobalIndex } from '../types';

interface LineState {
  isExpanded: boolean;
  isVisible: boolean;
  hasChildren: boolean;
}

interface FileViewProps {
  file: NoteFile;
  highlightLine: number | null;
  globalIndex: GlobalIndex;
  onLinkClick: (file: string, lineNum: number) => void;
  onLinkNotFound: (marker: string) => void;
  searchHighlights?: Map<string, [number, number][]>;
  lineStates: LineState[];
  toggleLine: (lineId: string) => void;
}

export function FileView({
  file,
  highlightLine,
  globalIndex,
  onLinkClick,
  onLinkNotFound,
  searchHighlights,
  lineStates,
  toggleLine
}: FileViewProps) {
  const highlightedLineRef = useRef<HTMLDivElement>(null);
  const globalIndexRef = useRef(globalIndex);
  globalIndexRef.current = globalIndex;
  const onLinkClickRef = useRef(onLinkClick);
  onLinkClickRef.current = onLinkClick;
  const onLinkNotFoundRef = useRef(onLinkNotFound);
  onLinkNotFoundRef.current = onLinkNotFound;

  useEffect(() => {
    if (highlightLine !== null && highlightedLineRef.current) {
      highlightedLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightLine]);

  const handleLinkClick = (marker: string) => {
    const target = globalIndexRef.current.markerToFile[marker];
    if (target) {
      onLinkClickRef.current(target.file, target.lineNum);
    } else {
      onLinkNotFoundRef.current(marker);
    }
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>
      <div style={{ padding: 'var(--space-2) 0' }}>
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
