import { useState, useCallback, useEffect } from 'react';
import type { Tab } from '../types';

const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') || '/';
const STORAGE_KEY = `notes-tabs:${basePath}`;
const HOME_TAB_ID = 'home';

const HOME_TAB: Tab = {
  id: HOME_TAB_ID,
  file: '',
  lineNum: null,
  label: '首页'
};

export function useTabs() {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const savedTabs = JSON.parse(saved) as Tab[];
          return [HOME_TAB, ...savedTabs];
        } catch {
          // Invalid data, ignore
        }
      }
    }
    return [HOME_TAB];
  });
  
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    return HOME_TAB_ID;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tabsToSave = tabs.filter(t => t.id !== HOME_TAB_ID);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tabsToSave));
    }
  }, [tabs]);

  const activeTab = tabs.find(t => t.id === activeTabId) || null;
  
  const isHomeTab = activeTabId === HOME_TAB_ID;

  const openTab = useCallback((file: string, lineNum: number | null = null) => {
    const label = lineNum 
      ? `${file}:${lineNum}`
      : file;
    
    const existingTab = tabs.find(t => 
      t.file === file && t.lineNum === lineNum
    );
    
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return existingTab;
    }
    
    const newTab: Tab = {
      id: `${file}-${lineNum || 'full'}-${Date.now()}`,
      file,
      lineNum,
      label
    };
    
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    return newTab;
  }, [tabs]);

  const closeTab = useCallback((tabId: string) => {
    if (tabId === HOME_TAB_ID) return;
    
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      
      if (activeTabId === tabId) {
        const closedIndex = prev.findIndex(t => t.id === tabId);
        const newActiveIndex = Math.max(0, Math.min(closedIndex - 1, newTabs.length - 1));
        setActiveTabId(newTabs[newActiveIndex]?.id || HOME_TAB_ID);
      }
      
      return newTabs;
    });
  }, [activeTabId]);

  const switchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const openHome = useCallback(() => {
    setActiveTabId(HOME_TAB_ID);
  }, []);

  return {
    tabs,
    activeTab,
    activeTabId,
    isHomeTab,
    openTab,
    closeTab,
    switchTab,
    openHome,
    HOME_TAB_ID
  };
}
