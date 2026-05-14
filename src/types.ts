export interface NoteLine {
  id: string;
  file: string;
  lineNum: number;
  indent: number;
  content: string;
  originalLine: string;
  marker: string | null;
  links: string[];
  isHeading: boolean;
  headingLevel: number;
  descendantCount: number;
  lineType: 'bullet' | 'quote' | 'normal';
}

export interface NoteFile {
  name: string;
  lines: NoteLine[];
  markerMap: Record<string, number>;
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
  lineNum: number | null;
  label: string;
}

export interface SearchResult {
  line: NoteLine;
  highlights: [number, number][];
}

export interface BacklinkResult {
  line: NoteLine;
  pattern: string;
}
