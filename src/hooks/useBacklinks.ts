import { useMemo } from 'react';
import type { NoteLine, BacklinkResult } from '../types';

export function useBacklinks(allLines: NoteLine[]) {
  const backlinkIndex = useMemo(() => {
    const index = new Map<string, BacklinkResult[]>();
    
    for (const line of allLines) {
      for (const pattern of line.links) {
        if (!index.has(pattern)) {
          index.set(pattern, []);
        }
        index.get(pattern)!.push({ line, pattern });
      }
    }
    
    return index;
  }, [allLines]);

  const getBacklinks = (marker: string): BacklinkResult[] => {
    return backlinkIndex.get(marker) || [];
  };

  const isUniqueBacklink = (marker: string): boolean => {
    const backlinks = backlinkIndex.get(marker);
    return backlinks ? backlinks.length === 1 : false;
  };

  return { getBacklinks, isUniqueBacklink, backlinkIndex };
}
