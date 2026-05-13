import { useState, useCallback, useMemo } from 'react';
import type { NoteLine, SearchResult } from '../types';

export function useSearch(allLines: NoteLine[]) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (searchTerms.length === 0) return [];
    
    const results: SearchResult[] = [];
    
    for (const line of allLines) {
      const contentLower = line.content.toLowerCase();
      const allTermsMatch = searchTerms.every(term => 
        contentLower.includes(term)
      );
      
      if (allTermsMatch) {
        // Find highlight positions
        const highlights: [number, number][] = [];
        for (const term of searchTerms) {
          let pos = 0;
          while (true) {
            const idx = contentLower.indexOf(term, pos);
            if (idx === -1) break;
            highlights.push([idx, idx + term.length]);
            pos = idx + 1;
          }
        }
        
        // Sort and merge overlapping highlights
        highlights.sort((a, b) => a[0] - b[0]);
        const merged: [number, number][] = [];
        for (const h of highlights) {
          if (merged.length > 0 && merged[merged.length - 1][1] >= h[0]) {
            merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], h[1]);
          } else {
            merged.push(h);
          }
        }
        
        results.push({ line, highlights: merged });
      }
    }
    
    return results;
  }, [query, allLines]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setIsSearching(false);
  }, []);

  const startSearch = useCallback(() => {
    setIsSearching(true);
  }, []);

  return {
    query,
    setQuery,
    searchResults,
    isSearching,
    setIsSearching,
    clearSearch,
    startSearch
  };
}
