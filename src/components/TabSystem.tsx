import React from 'react';
import type { Tab } from '../types';

interface TabSystemProps {
  tabs: Tab[];
  activeTabId: string | null;
  onSwitchTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onOpenFile: (file: string) => void;
  files: string[];
}

export function TabSystem({
  tabs,
  activeTabId,
  onSwitchTab,
  onCloseTab,
  onOpenFile,
  files
}: TabSystemProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center bg-gray-200 border-b overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center gap-1 px-3 py-2 cursor-pointer border-r border-gray-300
              ${tab.id === activeTabId 
                ? 'bg-white border-t-2 border-t-blue-500' 
                : 'bg-gray-100 hover:bg-gray-150'}`}
            onClick={() => onSwitchTab(tab.id)}
          >
            <span className="text-sm truncate max-w-32">{tab.label}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              className="ml-1 text-gray-400 hover:text-gray-600 text-xs w-4 h-4 flex items-center justify-center rounded hover:bg-gray-300"
              aria-label="Close tab"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-2 p-2 bg-gray-50 border-b">
        <label className="text-sm text-gray-600">打开文件:</label>
        <select
          onChange={(e) => {
            if (e.target.value) {
              onOpenFile(e.target.value);
              e.target.value = '';
            }
          }}
          className="px-2 py-1 border rounded text-sm bg-white"
          defaultValue=""
        >
          <option value="" disabled>选择文件...</option>
          {files.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
