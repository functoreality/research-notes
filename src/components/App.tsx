import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FileView } from './FileView';
import { TabSystem } from './TabSystem';
import { SearchPanel } from './SearchPanel';
import { useTabs } from '../hooks/useTabs';
import { useSearch } from '../hooks/useSearch';
import type { NotesData } from '../types';

interface AppProps {
  initialFile?: string;
  initialLine?: number;
}

export function App({ initialFile, initialLine }: AppProps) {
  const [data, setData] = useState<NotesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { tabs, activeTab, activeTabId, openTab, closeTab, switchTab } = useTabs();
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  
  useEffect(() => {
    const basePath = import.meta.env.BASE_URL || '/';
    fetch(`${basePath}data/notes.json`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        setData(json as NotesData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
  
  const allLines = useMemo(() => {
    if (!data) return [];
    return Object.values(data.files).flatMap(f => f.lines);
  }, [data]);
  
  const {
    query,
    setQuery,
    searchResults,
    isSearching,
    setIsSearching,
    clearSearch,
    startSearch
  } = useSearch(allLines);

  useEffect(() => {
    if (!data) return;
    
    if (initialFile) {
      openTab(initialFile, initialLine || null);
      if (initialLine) {
        setHighlightLine(initialLine);
      }
    } else if (Object.keys(data.files).length > 0) {
      const firstFile = Object.keys(data.files)[0];
      openTab(firstFile, null);
    }
  }, [initialFile, initialLine, openTab, data]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        startSearch();
      }
      if (e.key === 'Escape' && isSearching) {
        clearSearch();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearching, startSearch, clearSearch]);

  const handleLinkClick = useCallback((file: string, lineNum: number) => {
    openTab(file, lineNum);
    setHighlightLine(lineNum);
    
    const url = new URL(window.location.href);
    url.searchParams.set('file', file);
    url.searchParams.set('line', String(lineNum));
    window.history.pushState({}, '', url.toString());
  }, [openTab]);

  const handleOpenFile = useCallback((file: string) => {
    openTab(file, null);
    setHighlightLine(null);
    
    const url = new URL(window.location.href);
    url.searchParams.set('file', file);
    url.searchParams.delete('line');
    window.history.pushState({}, '', url.toString());
  }, [openTab]);

  const handleSearchResultClick = useCallback((file: string, lineNum: number) => {
    openTab(file, lineNum);
    setHighlightLine(lineNum);
  }, [openTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-500">加载笔记数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-500">加载失败: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const activeFile = activeTab ? data.files[activeTab.file] : null;
  const fileList = Object.keys(data.files).sort();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-blue-600 text-white px-4 py-3 shadow-md">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold">Research Notes</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={startSearch}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded hover:bg-white/20 text-sm"
            >
              <span>🔍 搜索</span>
              <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs">⌘K</kbd>
            </button>
          </div>
        </div>
      </header>
      
      <TabSystem
        tabs={tabs}
        activeTabId={activeTabId}
        onSwitchTab={switchTab}
        onCloseTab={closeTab}
        onOpenFile={handleOpenFile}
        files={fileList}
      />
      
      <main className="flex-1 overflow-y-auto">
        {activeFile ? (
          <FileView
            file={activeFile}
            highlightLine={highlightLine}
            globalIndex={data.index}
            onLinkClick={handleLinkClick}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-4">📄</div>
              <p>选择一个文件开始阅读</p>
            </div>
          </div>
        )}
      </main>
      
      <SearchPanel
        query={query}
        results={searchResults}
        isActive={isSearching}
        onQueryChange={setQuery}
        onResultClick={handleSearchResultClick}
        onClose={clearSearch}
      />
    </div>
  );
}
