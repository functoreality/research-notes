// Types for the notes application

export interface NoteLine {
  id: string;           // fileName-lineNum
  file: string;         // File name
  lineNum: number;      // Line number (1-indexed)
  indent: number;       // Indentation level (number of tabs)
  content: string;      // Content (without bullet, marker)
  originalLine: string; // Original line content
  marker: string | null; // End-of-line marker {pattern}
  links: string[];      // Links in content ((pattern))
  isQuote: boolean;     // Is this a quote line (>)
  bullet: '*' | '>' | null; // Bullet type
}

export interface NoteFile {
  name: string;
  lines: NoteLine[];
  markerMap: Record<string, number>; // marker -> lineNum
}

export interface GlobalIndex {
  markerToFile: Record<string, { file: string; lineNum: number }>;
  files: Array<{
    name: string;
    lineCount: number;
    markerMap: Record<string, number>;
  }>;
}

export interface NotesData {
  files: Record<string, NoteFile>;
  index: GlobalIndex;
}

export interface Tab {
  id: string;
  file: string;
  lineNum: number | null; // null means show full file
  label: string;
}

export interface SearchResult {
  line: NoteLine;
  highlights: [number, number][]; // Start/end positions of matches
}
