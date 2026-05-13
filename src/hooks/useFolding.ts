import { useState, useCallback, useLayoutEffect } from 'react';
import type { NoteLine } from '../types';

export function useFolding(lines: NoteLine[], highlightLine: number | null) {
  // Track which indentation levels are expanded for each line
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set());

  // When highlighting a line, expand all its parents
  useLayoutEffect(() => {
    if (highlightLine !== null) {
      // Find the line and all its parents
      const targetIdx = lines.findIndex(l => l.lineNum === highlightLine);
      if (targetIdx === -1) return;

      const targetLine = lines[targetIdx];
      const targetIndent = targetLine.indent;
      
      // Walk backwards to find all parents that need to be expanded
      const parentsToExpand: string[] = [];
      let currentIndent = targetIndent - 1;
      
      for (let i = targetIdx - 1; i >= 0; i--) {
        const line = lines[i];
        if (line.indent === currentIndent) {
          parentsToExpand.push(line.id);
          currentIndent--;
        }
        if (currentIndent < 0) break;
      }

      // Also expand the target line itself (one more level)
      const targetLineId = targetLine.id;
      
      setExpandedLines(prev => {
        const newSet = new Set(prev);
        parentsToExpand.forEach(id => newSet.add(id));
        newSet.add(targetLineId);
        return newSet;
      });
    }
  }, [highlightLine, lines]);

  const isLineExpanded = useCallback((line: NoteLine) => {
    return expandedLines.has(line.id);
  }, [expandedLines]);

  const toggleLine = useCallback((line: NoteLine) => {
    setExpandedLines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(line.id)) {
        newSet.delete(line.id);
      } else {
        newSet.add(line.id);
      }
      return newSet;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedLines(new Set(lines.map(l => l.id)));
  }, [lines]);

  const collapseAll = useCallback(() => {
    setExpandedLines(new Set());
  }, []);

  // Determine if a line is visible based on parent expansion
  const isLineVisible = useCallback((line: NoteLine, index: number) => {
    if (line.indent === 0) return true;
    
    // Check if all parent lines are expanded
    let parentIndent = line.indent - 1;
    for (let i = index - 1; i >= 0; i--) {
      const prevLine = lines[i];
      if (prevLine.indent === parentIndent) {
        if (!expandedLines.has(prevLine.id)) {
          return false;
        }
        parentIndent--;
      }
      if (parentIndent < 0) break;
    }
    return true;
  }, [lines, expandedLines]);

  return {
    isLineExpanded,
    toggleLine,
    expandAll,
    collapseAll,
    isLineVisible
  };
}
