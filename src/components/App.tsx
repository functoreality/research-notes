import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { FileView } from './FileView';
import { SearchPanel } from './SearchPanel';
import { useTabs } from '../hooks/useTabs';
import { useSearch } from '../hooks/useSearch';
import { useFolding } from '../hooks/useFolding';
import type { NotesData } from '../types';

type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

interface AppProps {
  initialFile?: string;
  initialLine?: number;
}

export function App({ initialFile, initialLine }: AppProps) {
  const [data, setData] = useState<NotesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  
  const { tabs, activeTab, activeTabId, openTab, closeTab, switchTab } = useTabs();
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const fileSelectorRef = useRef<HTMLDivElement>(null);
  
  const activeFile = activeTab ? data?.files[activeTab.file] : null;
  
  const folding = useFolding(activeFile?.lines || [], highlightLine);
  
  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
  }, []);
  
  useEffect(() => {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  }, [theme]);
  
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolvedTheme(getSystemTheme());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system';
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);
  
  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    const basePath = base.endsWith('/') ? base : base + '/';
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
      if (e.key === 'Escape') {
        if (isSearching) {
          clearSearch();
        }
        if (showFileSelector) {
          setShowFileSelector(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearching, startSearch, clearSearch, showFileSelector]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fileSelectorRef.current && !fileSelectorRef.current.contains(e.target as Node)) {
        setShowFileSelector(false);
      }
    };
    
    if (showFileSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFileSelector]);

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
    setShowFileSelector(false);
    
    const url = new URL(window.location.href);
    url.searchParams.set('file', file);
    url.searchParams.delete('line');
    window.history.pushState({}, '', url.toString());
  }, [openTab]);

  const handleSearchResultClick = useCallback((file: string, lineNum: number) => {
    openTab(file, lineNum);
    setHighlightLine(lineNum);
  }, [openTab]);

  const handleTabClose = useCallback((tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeTab(tabId);
  }, [closeTab]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: 'var(--color-paper)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}>⋯</div>
          <p style={{ color: 'var(--color-text-muted)' }}>加载中</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: 'var(--color-paper)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-code)' }}>✕</div>
          <p style={{ color: 'var(--color-code)' }}>加载失败: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const fileList = Object.keys(data.files).sort();

  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: 'var(--color-paper)', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <header className="header-bar">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          flex: 1, 
          overflowX: 'auto',
          overflowY: 'hidden',
          gap: '1px',
          scrollbarWidth: 'none'
        }}>
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
              onClick={() => switchTab(tab.id)}
            >
              <span style={{ 
                maxWidth: '120px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                fontFamily: 'var(--font-display)'
              }}>
                {tab.label}
              </span>
              <button
                className="tab-close"
                onClick={(e) => handleTabClose(tab.id, e)}
                aria-label="关闭标签"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2px',
          flexShrink: 0
        }}>
          <button 
            className="icon-btn" 
            onClick={folding.expandAll}
            title="展开全部"
            aria-label="展开全部"
          >
            ↓
          </button>
          
          <button 
            className="icon-btn" 
            onClick={folding.collapseAll}
            title="折叠全部"
            aria-label="折叠全部"
          >
            ↑
          </button>
          
          <button 
            className="icon-btn" 
            onClick={startSearch}
            title="搜索 (⌘K)"
            aria-label="搜索"
          >
            ⌕
          </button>
          
          <button 
            className="icon-btn" 
            onClick={toggleTheme}
            title={theme === 'system' ? `跟随系统 (${resolvedTheme === 'dark' ? '深色' : '浅色'})` : theme === 'dark' ? '深色模式' : '浅色模式'}
            aria-label="切换主题"
          >
            {theme === 'system' ? '☍' : theme === 'dark' ? '◐' : '○'}
          </button>
          
          <div className="file-selector" ref={fileSelectorRef}>
            <button 
              className="file-selector-btn"
              onClick={() => setShowFileSelector(!showFileSelector)}
              aria-label="打开文件"
              aria-expanded={showFileSelector}
            >
              <span>+</span>
            </button>
            
            {showFileSelector && (
              <div className="file-selector-dropdown">
                {fileList.map(f => (
                  <div
                    key={f}
                    className="file-selector-item"
                    onClick={() => handleOpenFile(f)}
                  >
                    {f}.md
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main style={{ 
        flex: 1, 
        overflow: 'auto', 
        marginTop: 'var(--header-height)',
        minHeight: 0
      }}>
        {activeFile ? (
          <FileView
            file={activeFile}
            highlightLine={highlightLine}
            globalIndex={data.index}
            onLinkClick={handleLinkClick}
            lineStates={folding.lineStates}
            toggleLine={folding.toggleLine}
          />
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }}>○</div>
              <p>选择文件开始阅读</p>
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
