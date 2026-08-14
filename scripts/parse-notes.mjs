#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NOTES_DIR = path.resolve(
  process.env.NOTES_INPUT_DIR || path.join(__dirname, '..', 'raw')
);
const OUTPUT_FILE = path.resolve(
  process.env.NOTES_OUTPUT_FILE || path.join(__dirname, '..', 'public', 'data', 'notes.json')
);
const OUTPUT_DIR = path.dirname(OUTPUT_FILE);

const LINK_PATTERN = /\(\(([_\w]+)\)\)/g;
const MARKER_PATTERN = /\{([_\w]+)\}$/;
const INDENT_PATTERN = /^(\t*)/;
const HEADING_PATTERN = /^#+\s/;
const BULLET_PATTERN = /^\*\s/;
const QUOTE_PATTERN = /^>\s/;

function parseLine(line, lineNum, fileName) {
  if (line.trim() === '') return null;
  
  const indentMatch = line.match(INDENT_PATTERN);
  const indent = indentMatch ? indentMatch[1].length : 0;
  let content = line.slice(indent);
  
  const isHeading = indent === 0 && HEADING_PATTERN.test(content);
  
  let headingLevel = 0;
  let lineType = 'normal';
  
  if (isHeading) {
    const headingMatch = content.match(/^(#+)\s*/);
    if (headingMatch) {
      headingLevel = headingMatch[1].length;
      content = content.slice(headingMatch[0].length);
    }
  } else {
    if (QUOTE_PATTERN.test(content)) {
      lineType = 'quote';
      content = content.replace(QUOTE_PATTERN, '');
    } else if (BULLET_PATTERN.test(content)) {
      lineType = 'bullet';
      content = content.replace(BULLET_PATTERN, '');
    }
  }
  
  let marker = null;
  const markerMatch = content.match(MARKER_PATTERN);
  if (markerMatch) {
    marker = markerMatch[1];
    content = content.slice(0, -markerMatch[0].length);
  }
  
  const links = [];
  let linkMatch;
  while ((linkMatch = LINK_PATTERN.exec(content)) !== null) {
    links.push(linkMatch[1]);
  }
  LINK_PATTERN.lastIndex = 0;
  
  return {
    id: `${fileName}-${lineNum}`,
    file: fileName,
    lineNum,
    indent,
    content: content.trim(),
    // originalLine: line,  // COMMENTED OUT: 字段未被前端使用，移除以减小 JSON 体积
    marker,
    links,
    isHeading,
    headingLevel,
    lineType
  };
}

function parseFile(filePath) {
  const fileName = path.basename(filePath, '.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const parsedLines = [];
  const markerMap = new Map();
  
  for (let i = 0; i < lines.length; i++) {
    const parsed = parseLine(lines[i], i + 1, fileName);
    if (parsed) {
      parsedLines.push(parsed);
      if (parsed.marker) {
        markerMap.set(parsed.marker, parsed.lineNum);
      }
    }
  }
  
  for (let i = 0; i < parsedLines.length; i++) {
    const line = parsedLines[i];
    let count = 0;
    for (let j = i + 1; j < parsedLines.length; j++) {
      if (parsedLines[j].indent <= line.indent) break;
      count++;
    }
    line.descendantCount = count;
  }
  
  return {
    name: fileName,
    lines: parsedLines,
    markerMap: Object.fromEntries(markerMap)
  };
}

function buildGlobalIndex(files) {
  const markerToFile = new Map();
  
  for (const file of files) {
    for (const [marker, lineNum] of Object.entries(file.markerMap)) {
      markerToFile.set(marker, { file: file.name, lineNum });
    }
  }
  
  return {
    markerToFile: Object.fromEntries(markerToFile),
    files: files.map(f => ({
      name: f.name,
      lineCount: f.lines.length,
      markerMap: f.markerMap
    }))
  };
}

function main() {
  console.log('Parsing notes...');
  console.log(`Notes directory: ${NOTES_DIR}`);
  
  const mdFiles = fs.readdirSync(NOTES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(NOTES_DIR, f))
    .sort();
  
  console.log(`Found ${mdFiles.length} markdown files`);
  
  const parsedFiles = mdFiles.map(f => {
    console.log(`  Parsing: ${path.basename(f)}`);
    return parseFile(f);
  });
  
  const index = buildGlobalIndex(parsedFiles);
  
  const output = {
    files: Object.fromEntries(parsedFiles.map(f => [f.name, f])),
    index
  };
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\nOutput written to: ${OUTPUT_FILE}`);
  console.log(`Total lines: ${index.files.reduce((sum, f) => sum + f.lineCount, 0)}`);
  console.log(`Total markers: ${Object.keys(index.markerToFile).length}`);
}

main();
