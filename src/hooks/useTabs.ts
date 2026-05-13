import { useState, useCallback, useEffect } from 'react';
import type { Tab } from '../types';

const STORAGE_KEY = 'notes-tabs';

export function useTabs() {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved) as Tab[];
        } catch {
          // Invalid data, ignore
        }
      }
    }
    return [];
  });
  
  const [activeTabId, setActiveTabId] = useState<string | null>(() => {
    if (tabs.length > 0) {
      return tabs[0].id;
    }
    return null;
  });

  // persist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    }
  }, [tabs]);

  const activeTab = tabs.find(t => t.id === activeTabId) || null;

  const openTab = useCallback((file: string, lineNum: number | null = null) => {
    const label = lineNum 
      ? `${file}:${lineNum}`
      : file;
    
    // Check if tab already exists
    const existingTab = tabs.find(t => 
      t.file === file && t.lineNum === lineNum
    );
    
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return existingTab;
    }
    
    // Create new tab
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
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      
      // If closing active tab, switch to another
      if (activeTabId === tabId && newTabs.length > 0) {
        const closedIndex = prev.findIndex(t => t.id === tabId);
        const newActiveIndex = Math.min(closedIndex, newTabs.length - 1);
        setActiveTabId(newTabs[newActiveIndex].id);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
      }
      
      return newTabs;
    });
  }, [activeTabId]);

  const switchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  return {
    tabs,
    activeTab,
    activeTabId,
    openTab,
    closeTab,
    switchTab
  };
}
