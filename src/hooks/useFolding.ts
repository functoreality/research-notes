import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { NoteLine } from '../types';

interface LineState {
  isExpanded: boolean;
  isVisible: boolean;
  hasChildren: boolean;
}

export function useFolding(lines: NoteLine[], highlightLine: number | null) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const linesRef = useRef(lines);
  linesRef.current = lines;

  const lineStates: LineState[] = useMemo(() => {
    return lines.map((line, index) => {
      const isExpanded = expandedIds.has(line.id);
      
      let isVisible = true;
      if (line.indent > 0) {
        let parentIndent = line.indent - 1;
        for (let i = index - 1; i >= 0; i--) {
          const prevLine = lines[i];
          if (prevLine.indent === parentIndent) {
            if (!expandedIds.has(prevLine.id)) {
              isVisible = false;
              break;
            }
            parentIndent--;
          }
          if (parentIndent < 0) break;
        }
      }
      
      const hasChildren = index < lines.length - 1 && 
                          lines[index + 1].indent > line.indent;
      
      return { isExpanded, isVisible, hasChildren };
    });
  }, [lines, expandedIds]);

  const toggleLine = useCallback((lineId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(lines.map(l => l.id)));
  }, [lines]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  useEffect(() => {
    if (highlightLine === null) return;
    
    const targetIdx = lines.findIndex(l => l.lineNum === highlightLine);
    if (targetIdx === -1) return;

    const targetLine = lines[targetIdx];
    const targetIndent = targetLine.indent;
    
    const toAdd: string[] = [];
    let currentIndent = targetIndent - 1;
    for (let i = targetIdx - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.indent === currentIndent) {
        toAdd.push(line.id);
        currentIndent--;
      }
      if (currentIndent < 0) break;
    }
    toAdd.push(targetLine.id);

    setExpandedIds(prev => {
      const next = new Set(prev);
      for (const id of toAdd) {
        next.add(id);
      }
      return next;
    });
  }, [highlightLine, lines]);

  return {
    lineStates,
    toggleLine,
    expandAll,
    collapseAll
  };
}
