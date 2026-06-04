import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { NoteLine, SearchResult } from '../types';

const DEBOUNCE_MS = 300;
const MAX_RESULTS = 200;

/** 单字符 ASCII（英文/数字/标点）跳过，但允许单汉字等非 ASCII 字符 */
function shouldSkipSearch(q: string): boolean {
  const trimmed = q.trim();
  if (trimmed.length === 0) return true;
  if (trimmed.length === 1 && trimmed.charCodeAt(0) <= 127) return true;
  return false;
}

export function useSearch(allLines: NoteLine[]) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce: 输入停顿 300ms 后才触发搜索
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const searchResults = useMemo(() => {
    if (shouldSkipSearch(debouncedQuery)) return [];

    const searchTerms = debouncedQuery.toLowerCase().split(/\s+/).filter(Boolean);
    if (searchTerms.length === 0) return [];

    const results: SearchResult[] = [];

    for (const line of allLines) {
      const contentLower = line.content.toLowerCase();
      const allTermsMatch = searchTerms.every(term =>
        contentLower.includes(term)
      );

      if (!allTermsMatch) continue;

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
      if (results.length >= MAX_RESULTS) break;
    }

    return results;
  }, [debouncedQuery, allLines]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
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
