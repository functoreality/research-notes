import React, { useEffect, useState, useRef } from 'react';
import type { NotesData } from '../types';

interface HomePageProps {
  data: NotesData;
  onOpenFile: (file: string) => void;
  siteName: string;
  visitorCount?: string | null;
}

interface StatsData {
  pagePv: string;
  sitePv: string;
  siteUv: string;
}

function readStats(): StatsData | null {
  const pagePv = document.getElementById('busuanzi_value_page_pv')?.textContent?.trim();
  const sitePv = document.getElementById('busuanzi_value_site_pv')?.textContent?.trim();
  const siteUv = document.getElementById('busuanzi_value_site_uv')?.textContent?.trim();
  if (pagePv && /^\d+$/.test(pagePv)) {
    return { pagePv, sitePv: sitePv || '-', siteUv: siteUv || '-' };
  }
  return null;
}

export function HomePage({ data, onOpenFile, siteName, visitorCount }: HomePageProps) {
  const [content, setContent] = useState<string>('');
  const [stats, setStats] = useState<StatsData | null>(null);
  const statsPollRef = useRef(0);

  // 客户端检测 URL 查询参数，避免 Astro 静态模式下 Astro.url 不包含 query string
  const showStats = typeof window !== 'undefined' && window.location.search.includes('stats');

  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    const basePath = base.endsWith('/') ? base : base + '/';
    fetch(`${basePath}data/homepage.md`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(text => setContent(text))
      .catch(err => {
        console.error('Failed to load homepage:', err);
      });
  }, []);

  // 统计模式：轮询读取 Vercount DOM 数据（Vercount 脚本异步填充）
  useEffect(() => {
    if (!showStats) return;
    const poll = () => {
      const data = readStats();
      if (data) { setStats(data); clearInterval(statsPollRef.current); }
    };
    poll();
    statsPollRef.current = window.setInterval(poll, 500);
    return () => clearInterval(statsPollRef.current);
  }, [showStats]);

  if (!content) {
    return (
      <div style={{
        padding: 'var(--space-6)',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text-muted)',
        textAlign: 'center'
      }}>
        加载中...
      </div>
    );
  }

  const existingFiles = new Set(Object.keys(data.files));

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: 'var(--space-6) var(--space-4)',
      fontFamily: 'var(--font-body)',
      color: 'var(--color-text)',
      lineHeight: 1.7
    }}>
      {renderMarkdown(content, existingFiles, onOpenFile)}

      {/* 如需显示简单的访问计数，取消下方注释，并将 "X" 替换为 "{visitorCount}" */}
      {/* <div style={{ textAlign:'left', padding:'.5rem .5rem', color:'var(--color-text-muted)', fontSize:'.85rem', borderTop:'1px solid var(--color-paper-line)' }}>
        这份科研笔记是第 X 次有人来看啦
      </div> */}

      {showStats && stats && (
        <div style={{
          padding: '.5rem .5rem',
          color: 'var(--color-text-muted)',
          fontSize: '.85rem',
          borderTop: '1px solid var(--color-paper-line)',
          marginTop: '2rem',
        }}>
          <div style={{ marginBottom: '.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
            恭喜你！这个统计面板只在 ?stats 时显示，被你发现啦！
          </div>
          <div style={{ marginBottom: '.4rem' }}>
            本页访问量（仅 {siteName}）：<b>{stats.pagePv}</b>
            <span style={{ fontSize: '.7rem', opacity: .6, marginLeft: '.3rem' }}>page_pv</span>
          </div>
          <div style={{ marginBottom: '.4rem' }}>
            站点总访问量：<b>{stats.sitePv}</b>
            <span style={{ fontSize: '.7rem', opacity: .6, marginLeft: '.3rem' }}>site_pv</span>
          </div>
          <div>
            站点总访客数：<b>{stats.siteUv}</b>
            <span style={{ fontSize: '.7rem', opacity: .6, marginLeft: '.3rem' }}>site_uv</span>
          </div>
        </div>
      )}
    </div>
  );
}

function renderMarkdown(
  content: string, 
  existingFiles: Set<string>, 
  onOpenFile: (file: string) => void
): React.ReactNode[] {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          fontFamily: 'var(--font-display)',
          marginTop: 'var(--space-6)',
          marginBottom: 'var(--space-3)',
          color: 'var(--color-text)',
          borderBottom: '2px solid var(--color-paper-line)',
          paddingBottom: 'var(--space-1)'
        }}>
          {line.slice(3)}
        </h2>
      );
      i++;
    } else if (line.startsWith('* ')) {
      const filesPart = line.slice(2).trim();
      const files = filesPart.split(/\s+/).filter(f => f.length > 0);
      
      elements.push(
        <div key={key++} style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-3)'
        }}>
          {files.map((file, fileIndex) => {
            const exists = existingFiles.has(file);
            return (
              <button
                key={fileIndex}
                onClick={() => exists && onOpenFile(file)}
                disabled={!exists}
                style={{
                  background: 'var(--color-paper-dark)',
                  border: 'none',
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.9rem',
                  cursor: exists ? 'pointer' : 'default',
                  color: exists ? 'var(--color-link)' : 'var(--color-text-light)',
                  transition: 'all var(--transition-fast)',
                  opacity: exists ? 1 : 0.5
                }}
                onMouseEnter={(e) => {
                  if (exists) {
                    e.currentTarget.style.backgroundColor = 'var(--color-link)';
                    e.currentTarget.style.color = 'var(--color-paper)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (exists) {
                    e.currentTarget.style.backgroundColor = 'var(--color-paper-dark)';
                    e.currentTarget.style.color = 'var(--color-link)';
                  }
                }}
              >
                {file}
              </button>
            );
          })}
        </div>
      );
      i++;
    } else if (line.trim() === '') {
      i++;
    } else {
      const paragraphLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('## ') && !lines[i].startsWith('* ')) {
        paragraphLines.push(lines[i]);
        i++;
      }
      
      if (paragraphLines.length > 0) {
        const paragraphContent = paragraphLines.join('\n');
        elements.push(
          <p key={key++} style={{
            marginBottom: 'var(--space-4)',
            color: 'var(--color-text)'
          }}>
            {renderLineWithLinks(paragraphContent)}
          </p>
        );
      }
    }
  }

  return elements;
}

function renderLineWithLinks(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let key = 0;
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    parts.push(
      <a
        key={key++}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: 'var(--color-link)',
          textDecoration: 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
      >
        {match[1]}
      </a>
    );
    
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
