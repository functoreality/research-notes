import React, { useEffect, useState } from 'react';
import type { NotesData } from '../types';

interface FileSummary {
  name: string;
  summary: string;
}

interface Batch {
  title: string;
  description: string;
  files: FileSummary[];
}

interface HomePageConfig {
  title: string;
  description: string;
  batches: Batch[];
  footer: string;
}

interface HomePageProps {
  data: NotesData;
  onOpenFile: (file: string) => void;
}

export function HomePage({ data, onOpenFile }: HomePageProps) {
  const [config, setConfig] = useState<HomePageConfig | null>(null);

  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    const basePath = base.endsWith('/') ? base : base + '/';
    fetch(`${basePath}data/homepage.json`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => setConfig(json as HomePageConfig))
      .catch(err => {
        console.error('Failed to load homepage config:', err);
      });
  }, []);

  if (!config) {
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
      color: 'var(--color-text)'
    }}>
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          marginBottom: 'var(--space-3)',
          color: 'var(--color-text)'
        }}>
          {config.title}
        </h1>
        <p style={{
          fontSize: '1rem',
          lineHeight: 1.7,
          color: 'var(--color-text-muted)'
        }}>
          {config.description}
        </p>
      </header>

      {config.batches.map((batch, batchIndex) => (
        <section key={batchIndex} style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            fontFamily: 'var(--font-display)',
            marginBottom: 'var(--space-2)',
            color: 'var(--color-text)',
            borderBottom: '2px solid var(--color-paper-line)',
            paddingBottom: 'var(--space-1)'
          }}>
            {batch.title}
          </h2>
          
          {batch.description && (
            <p style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-3)',
              lineHeight: 1.6
            }}>
              {batch.description}
            </p>
          )}

          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            {batch.files
              .filter(f => existingFiles.has(f.name))
              .map((file, fileIndex) => (
                <li key={fileIndex} style={{
                  marginBottom: 'var(--space-2)'
                }}>
                  <button
                    onClick={() => onOpenFile(file.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 'var(--space-2)',
                      background: 'none',
                      border: 'none',
                      padding: 'var(--space-2) var(--space-3)',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-md)',
                      transition: 'background-color var(--transition-fast)',
                      fontFamily: 'var(--font-body)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-paper-dark)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      color: 'var(--color-link)',
                      flexShrink: 0
                    }}>
                      {file.name}.md
                    </span>
                    <span style={{
                      fontSize: '0.9rem',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1.4
                    }}>
                      {file.summary}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}

      {config.footer && (
        <footer style={{
          marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--color-paper-line)',
          fontSize: '0.85rem',
          color: 'var(--color-text-light)',
          lineHeight: 1.6
        }}>
          {config.footer}
        </footer>
      )}
    </div>
  );
}
