import React, { useState, useCallback, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
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
type LocationTarget = { file: string; lineNum: number | null };

function resolveLocationTarget(data: NotesData, search: string): LocationTarget | null {
  const params = new URLSearchParams(search);
  const uid = params.get('uid');

  if (uid) {
    const target = data.index.markerToFile[uid];
    if (!target || !data.files[target.file]?.lines.some(line => line.lineNum === target.lineNum)) {
      return null;
    }
    return target;
  }

  const requestedFile = params.get('file');
  if (!requestedFile) return null;

  const file = requestedFile.replace(/\.md$/i, '');
  const noteFile = data.files[file];
  if (!noteFile) return null;

  const requestedLine = params.get('line');
  if (!requestedLine) return { file, lineNum: null };

  const lineNum = Number(requestedLine);
  if (!Number.isSafeInteger(lineNum) || lineNum < 1) {
    return { file, lineNum: null };
  }

  return noteFile.lines.some(line => line.lineNum === lineNum)
    ? { file, lineNum }
    : { file, lineNum: null };
}

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
  loadingHint: string;
  siteName: string;
  visitorLabel: string;
}

export function App({
  loadingHint,
  siteName,
  visitorLabel,
}: AppProps) {
  const [data, setData] = useState<NotesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState({ loaded: 0, total: 0 });
  const [isParsing, setIsParsing] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [visitorCount, setVisitorCount] = useState<string | null>(null);
  const [showVisitorTooltip, setShowVisitorTooltip] = useState(false);
  
  const { tabs, activeTab, activeTabId, isHomeTab, openTab, closeTab, switchTab, HOME_TAB_ID } = useTabs();
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const fileSelectorRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const mainRef = useRef<HTMLElement>(null);

  // 监听 Vercount 计数器元素的值变化
  useEffect(() => {
    const el = document.getElementById('busuanzi_value_page_pv');
    if (!el) return;
    const update = () => {
      const text = el.textContent?.trim();
      if (text && /^\d+$/.test(text)) setVisitorCount(text);
    };
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { childList: true, characterData: true, subtree: true });
    return () => obs.disconnect();
  }, []);
  
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

  const updateLocation = useCallback((target: LocationTarget | null) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('uid');
    url.searchParams.delete('file');
    url.searchParams.delete('line');

    if (target) {
      url.searchParams.set('file', target.file);
      if (target.lineNum !== null) {
        url.searchParams.set('line', String(target.lineNum));
      }
    }

    window.history.pushState({}, '', url);
  }, []);

  const navigateToTarget = useCallback((target: LocationTarget, updateUrl = true) => {
    openTab(target.file, target.lineNum);
    setHighlightLine(target.lineNum);
    if (updateUrl) updateLocation(target);
  }, [openTab, updateLocation]);

  const navigateHome = useCallback((updateUrl = true) => {
    switchTab(HOME_TAB_ID);
    setHighlightLine(null);
    if (updateUrl) updateLocation(null);
  }, [HOME_TAB_ID, switchTab, updateLocation]);

  useEffect(() => {
    if (!data || initializedRef.current) return;
    initializedRef.current = true;

    const target = resolveLocationTarget(data, window.location.search);
    if (target) navigateToTarget(target, false);

    setTimeout(() => {
      mainRef.current?.focus();
    }, 100);
  }, [data, navigateToTarget]);

  useEffect(() => {
    if (!data) return;

    const restoreLocation = () => {
      const target = resolveLocationTarget(data, window.location.search);
      if (target) {
        navigateToTarget(target, false);
      } else {
        navigateHome(false);
      }
    };

    window.addEventListener('popstate', restoreLocation);
    return () => window.removeEventListener('popstate', restoreLocation);
  }, [data, navigateHome, navigateToTarget]);

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
    navigateToTarget({ file, lineNum });
  }, [navigateToTarget]);

  const handleLinkNotFound = useCallback((marker: string) => {
    setToastMessage(`噢！${marker} 这条笔记好像没有公开`);
  }, []);

  const handleOpenFile = useCallback((file: string) => {
    navigateToTarget({ file, lineNum: null });
    setShowFileSelector(false);
  }, [navigateToTarget]);

  const handleSearchResultClick = useCallback((file: string, lineNum: number) => {
    navigateToTarget({ file, lineNum });
  }, [navigateToTarget]);

  const handleMarkerClick = useCallback((marker: string) => {
    const strippedMarker = marker.replace(/^\{|\}$/g, '');
    const backlinks = getBacklinks(strippedMarker);
    
    if (strippedMarker.startsWith('_') && backlinks.length === 1) {
      const target = backlinks[0];
      navigateToTarget({ file: target.line.file, lineNum: target.line.lineNum });
    } else {
      setBacklinkMarker(strippedMarker);
      setBacklinkResults(backlinks);
    }
  }, [getBacklinks, navigateToTarget]);

  const handleBacklinkClick = useCallback((file: string, lineNum: number) => {
    navigateToTarget({ file, lineNum });
    setBacklinkMarker(null);
    setBacklinkResults([]);
  }, [navigateToTarget]);

  const handleTabSwitch = useCallback((tabId: string) => {
    if (tabId === activeTabId) return;

    if (tabId === HOME_TAB_ID) {
      navigateHome();
      return;
    }

    const targetTab = tabs.find(tab => tab.id === tabId);
    if (!targetTab) return;

    switchTab(tabId);
    setHighlightLine(targetTab.lineNum);
    updateLocation({ file: targetTab.file, lineNum: targetTab.lineNum });
  }, [HOME_TAB_ID, activeTabId, navigateHome, switchTab, tabs, updateLocation]);

  const handleTabClose = useCallback((tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const closingIndex = tabs.findIndex(tab => tab.id === tabId);
    const isClosingActiveTab = tabId === activeTabId;
    const remainingTabs = tabs.filter(tab => tab.id !== tabId);
    const nextTab = isClosingActiveTab
      ? remainingTabs[Math.max(0, Math.min(closingIndex - 1, remainingTabs.length - 1))]
      : null;

    closeTab(tabId);

    if (!isClosingActiveTab) return;
    if (!nextTab || nextTab.id === HOME_TAB_ID) {
      setHighlightLine(null);
      updateLocation(null);
      return;
    }

    setHighlightLine(nextTab.lineNum);
    updateLocation({ file: nextTab.file, lineNum: nextTab.lineNum });
  }, [activeTabId, closeTab, tabs, updateLocation]);

  useLayoutEffect(() => {
    const { loaded } = downloadProgress;
    if (loaded > 0) {
      const initialLoadingEl = document.getElementById('initial-loading');
      if (initialLoadingEl) initialLoadingEl.classList.add('hidden');
    }
  }, [downloadProgress.loaded]);

  if (loading) {
    const { loaded, total } = downloadProgress;
    const isGzipped = total === -1;
    const progressPercent = total > 0 ? Math.round((loaded / total) * 100) : 0;
    const loadedMB = (loaded / 1024 / 1024).toFixed(1);
    const totalMB = total > 0 ? (total / 1024 / 1024).toFixed(1) : '';
    
    return (
      <div style={{ 
        position: 'fixed',
        inset: 0,
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
                笔记数据有点多，已经在努力搬运啦
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
                笔记数据有点多，已经在努力搬运啦
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
              <p style={{
                color: 'var(--color-text-muted)',
                fontSize: '13px',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
              }}>
                {loadingHint}
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
        position: 'fixed',
        inset: 0,
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
          onClick={() => handleTabSwitch(HOME_TAB_ID)}
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
              onClick={() => handleTabSwitch(tab.id)}
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
          
          {/* isHomeTab && (
            <div
              style={{ position: 'relative', display: 'inline-flex' }}
              onMouseEnter={() => setShowVisitorTooltip(true)}
              onMouseLeave={() => setShowVisitorTooltip(false)}
            >
              <button className="icon-btn" aria-label="访客统计">ℹ</button>
              {showVisitorTooltip && visitorCount && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: -60,
                  background: 'var(--color-ink)',
                  color: 'var(--color-tab-hover)',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  zIndex: 100,
                  fontFamily: 'var(--font-body)',
                }}>
                  {visitorLabel}是第 {visitorCount} 次有人来看啦
                </div>
              )}
            </div>
          ) */}
          
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
          <HomePage
            data={data}
            onOpenFile={handleOpenFile}
            siteName={siteName}
            visitorCount={visitorCount}
          />
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
