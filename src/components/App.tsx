import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { FileView } from './FileView';
import { SearchPanel } from './SearchPanel';
import { Toast } from './Toast';
import { BacklinkPanel } from './BacklinkPanel';
import { HomePage } from './HomePage';
import { useTabs } from '../hooks/useTabs';
import { useSearch } from '../hooks/useSearch';
import { useFolding } from '../hooks/useFolding';
import { useBacklinks } from '../hooks/useBacklinks';
import type { NotesData, BacklinkResult } from '../types';

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
  const [downloadProgress, setDownloadProgress] = useState({ loaded: 0, total: 0 });
  const [isParsing, setIsParsing] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const { tabs, activeTab, activeTabId, isHomeTab, openTab, closeTab, switchTab, HOME_TAB_ID } = useTabs();
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const fileSelectorRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const mainRef = useRef<HTMLElement>(null);
  
  const activeFile = isHomeTab ? null : (activeTab ? data?.files[activeTab.file] : null);
  
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
    
    requestAnimationFrame(() => {
      const initialLoading = document.getElementById('initial-loading');
      if (initialLoading) initialLoading.classList.add('hidden');
    });
    
    fetch(`${basePath}data/notes.json`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const contentLength = res.headers.get('content-length');
        const contentEncoding = res.headers.get('content-encoding');
        const isGzipped = contentEncoding === 'gzip';
        const total = contentLength && !isGzipped ? parseInt(contentLength, 10) : 0;
        
        if (!res.body) {
          return res.json();
        }
        
        const reader = res.body.getReader();
        const chunks: BlobPart[] = [];
        let loaded = 0;
        
        const pump = (): Promise<unknown> => {
          return reader.read().then(({ done, value }) => {
            if (done) {
              setIsParsing(true);
              const blob = new Blob(chunks);
              return blob.text();
            }
            
            chunks.push(value as BlobPart);
            loaded += value.length;
            setDownloadProgress({ loaded, total: isGzipped ? -1 : total });
            return pump();
          });
        };
        
        return pump() as Promise<string>;
      })
      .then(textOrJson => {
        const json = typeof textOrJson === 'string' ? JSON.parse(textOrJson) : textOrJson;
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

  const { getBacklinks, isUniqueBacklink } = useBacklinks(allLines);

  const [backlinkMarker, setBacklinkMarker] = useState<string | null>(null);
  const [backlinkResults, setBacklinkResults] = useState<BacklinkResult[]>([]);

  const closeBacklinkPanel = useCallback(() => {
    setBacklinkMarker(null);
    setBacklinkResults([]);
  }, []);

  useEffect(() => {
    if (!data || initializedRef.current) return;
    initializedRef.current = true;
    
    if (initialFile) {
      openTab(initialFile, initialLine || null);
      if (initialLine) {
        setHighlightLine(initialLine);
      }
    }
    
    // Focus main element after initial load
    setTimeout(() => {
      mainRef.current?.focus();
    }, 100);
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
        } else if (backlinkMarker) {
          closeBacklinkPanel();
        }
        if (showFileSelector) {
          setShowFileSelector(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearching, startSearch, clearSearch, showFileSelector, backlinkMarker, closeBacklinkPanel]);

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

  const handleLinkNotFound = useCallback((marker: string) => {
    setToastMessage(`噢！${marker} 这条笔记好像没有公开`);
  }, []);

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

  const handleMarkerClick = useCallback((marker: string) => {
    const strippedMarker = marker.replace(/^\{|\}$/g, '');
    const backlinks = getBacklinks(strippedMarker);
    
    if (strippedMarker.startsWith('_') && backlinks.length === 1) {
      const target = backlinks[0];
      openTab(target.line.file, target.line.lineNum);
      setHighlightLine(target.line.lineNum);
    } else {
      setBacklinkMarker(strippedMarker);
      setBacklinkResults(backlinks);
    }
  }, [getBacklinks, openTab]);

  const handleBacklinkClick = useCallback((file: string, lineNum: number) => {
    openTab(file, lineNum);
    setHighlightLine(lineNum);
    setBacklinkMarker(null);
    setBacklinkResults([]);
  }, [openTab]);

  const handleTabClose = useCallback((tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeTab(tabId);
  }, [closeTab]);

  if (loading) {
    const { loaded, total } = downloadProgress;
    const isGzipped = total === -1;
    const progressPercent = total > 0 ? Math.round((loaded / total) * 100) : 0;
    const loadedMB = (loaded / 1024 / 1024).toFixed(1);
    const totalMB = total > 0 ? (total / 1024 / 1024).toFixed(1) : '';
    
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: 'var(--color-paper)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', maxWidth: '320px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}>⋯</div>
          
          {isParsing ? (
            <>
              <p style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>正在努力解压数据</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                马上就好...
              </p>
            </>
          ) : isGzipped ? (
            <>
              <p style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                正在努力下载笔记数据
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                已下载 {loadedMB} MB
              </p>
              <div style={{
                width: '100%',
                height: '4px',
                backgroundColor: 'var(--color-paper-line)',
                borderRadius: '2px',
                marginTop: '12px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '30%',
                  height: '100%',
                  backgroundColor: 'var(--color-link)',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }} />
              </div>
            </>
          ) : total > 0 ? (
            <>
              <p style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                正在努力下载笔记数据
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                {progressPercent}% ({loadedMB} / {totalMB} MB)
              </p>
              <div style={{
                width: '100%',
                height: '4px',
                backgroundColor: 'var(--color-paper-line)',
                borderRadius: '2px',
                marginTop: '12px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  backgroundColor: 'var(--color-link)',
                  transition: 'width 0.2s ease'
                }} />
              </div>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>正在努力加载笔记数据</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                数据量大概 2MB，一分钟之内应该能加载好<br/>
                耐心等我一会儿啦——
              </p>
            </>
          )}
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

  // const fileList = Object.keys(data.files).sort();
  const fileList = Object.keys(data.files).sort((a, b) => 
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );

  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: 'var(--color-paper)', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <header className="header-bar">
        <div
          className={`tab ${HOME_TAB_ID === activeTabId ? 'active' : ''}`}
          onClick={() => switchTab(HOME_TAB_ID)}
          style={{ flexShrink: 0 }}
        >
          <span style={{ 
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center'
          }}>
            ⌂
          </span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          flex: 1, 
          overflowX: 'auto',
          overflowY: 'hidden',
          gap: '1px',
          scrollbarWidth: 'none'
        }}>
          {tabs.filter(tab => tab.id !== HOME_TAB_ID).map(tab => (
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
          {!isHomeTab && (
            <>
              <button 
                className="icon-btn" 
                onClick={folding.expandAll}
                title="展开全部 (可用于页面内搜索)"
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
            </>
          )}
          
          <button 
            className="icon-btn" 
            onClick={startSearch}
            title="搜索 (⌘K)"
            aria-label="搜索"
          >
            ⌕
          </button>
          
          <div className="file-selector" ref={fileSelectorRef}>
            <button 
              className="file-selector-btn"
              onClick={() => setShowFileSelector(!showFileSelector)}
              title="打开文件"
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
          
          <button 
            className="icon-btn" 
            onClick={toggleTheme}
            title={theme === 'system' ? `跟随系统 (${resolvedTheme === 'dark' ? '深色' : '浅色'})` : theme === 'dark' ? '深色模式' : '浅色模式'}
            aria-label="切换主题"
          >
            {theme === 'system' ? '☍' : theme === 'dark' ? '◐' : '○'}
          </button>
        </div>
      </header>
      
      <main 
        ref={mainRef}
        tabIndex={0}
        style={{ 
          flex: 1, 
          overflow: 'auto', 
          marginTop: 'var(--header-height)',
          minHeight: 0,
          outline: 'none'
        }}
      >
        {activeFile ? (
          <FileView
            file={activeFile}
            highlightLine={highlightLine}
            globalIndex={data.index}
            onLinkClick={handleLinkClick}
            onLinkNotFound={handleLinkNotFound}
            onMarkerClick={handleMarkerClick}
            lineStates={folding.lineStates}
            toggleLine={folding.toggleLine}
          />
        ) : (
          <HomePage data={data} onOpenFile={handleOpenFile} />
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
      
      {backlinkMarker && (
        <BacklinkPanel
          marker={backlinkMarker}
          results={backlinkResults}
          onResultClick={handleBacklinkClick}
          onClose={closeBacklinkPanel}
        />
      )}
      
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
