#!/usr/bin/env node

/**
 * Markdown Notes Parser
 * 
 * Parses research notes into structured JSON data for the frontend.
 * 
 * Input: ../research/*.md
 * Output: src/data/notes.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Research directory is at parent level (research-notes/research)
const RESEARCH_DIR = path.join(__dirname, '..', '..', 'research');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'notes.json');

// Regex patterns
const LINK_PATTERN = /\(\(([_\w]+)\)\)/g;        // ((pattern)) or ((_pattern))
const MARKER_PATTERN = /\{([_\w]+)\}$/;          // {pattern} at end of line
const QUOTE_PATTERN = /^(\t*)(>)\s*/;            // > quote
const BULLET_PATTERN = /^(\t*)(\*)\s*/;          // * bullet
const INLINE_MATH_PATTERN = /\$([^\$]+)\$/g;     // $...$
const BLOCK_MATH_PATTERN = /\$\$([\s\S]*?)\$\$/g; // $$...$$
const CODE_PATTERN = /`([^`]+)`/g;               // `...`

/**
 * Parse a single line of markdown
 */
function parseLine(line, lineNum, fileName) {
  // Determine line type and indent
  let indent = 0;
  let content = line;
  let isQuote = false;
  let bullet = null;
  
  // Check for quote
  const quoteMatch = line.match(QUOTE_PATTERN);
  if (quoteMatch) {
    indent = quoteMatch[1].length;
    isQuote = true;
    content = line.slice(quoteMatch[0].length);
    bullet = '>';
  } else {
    // Check for bullet
    const bulletMatch = line.match(BULLET_PATTERN);
    if (bulletMatch) {
      indent = bulletMatch[1].length;
      content = line.slice(bulletMatch[0].length);
      bullet = '*';
    }
  }
  
  // Extract marker from end of line
  let marker = null;
  const markerMatch = content.match(MARKER_PATTERN);
  if (markerMatch) {
    marker = markerMatch[1];
    content = content.slice(0, -markerMatch[0].length);
  }
  
  // Extract links from content
  const links = [];
  let linkMatch;
  while ((linkMatch = LINK_PATTERN.exec(content)) !== null) {
    links.push(linkMatch[1]);
  }
  
  // Reset regex lastIndex
  LINK_PATTERN.lastIndex = 0;
  
  return {
    id: `${fileName}-${lineNum}`,
    file: fileName,
    lineNum,
    indent,
    content: content.trim(),
    originalLine: line,
    marker,
    links,
    isQuote,
    bullet
  };
}

/**
 * Process inline formatting (for rendering)
 */
function processInlineContent(content) {
  // Keep original content for now - frontend will handle rendering
  return content;
}

/**
 * Parse a markdown file
 */
function parseFile(filePath) {
  const fileName = path.basename(filePath, '.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const parsedLines = [];
  const markerMap = new Map();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue; // Skip empty lines
    
    const parsed = parseLine(line, i + 1, fileName);
    parsedLines.push(parsed);
    
    // Build marker map
    if (parsed.marker) {
      markerMap.set(parsed.marker, parsed.lineNum);
    }
  }
  
  return {
    name: fileName,
    lines: parsedLines,
    markerMap: Object.fromEntries(markerMap)
  };
}

/**
 * Build global index from all files
 */
function buildGlobalIndex(files) {
  const markerToFile = new Map();
  const allLines = [];
  
  for (const file of files) {
    allLines.push(...file.lines);
    
    // Build marker -> file mapping
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

/**
 * Main function
 */
function main() {
  console.log('Parsing research notes...');
  console.log(`Research directory: ${RESEARCH_DIR}`);
  
  // Get all markdown files
  const mdFiles = fs.readdirSync(RESEARCH_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(RESEARCH_DIR, f))
    .sort();
  
  console.log(`Found ${mdFiles.length} markdown files`);
  
  // Parse all files
  const parsedFiles = mdFiles.map(f => {
    console.log(`  Parsing: ${path.basename(f)}`);
    return parseFile(f);
  });
  
  // Build global index
  const index = buildGlobalIndex(parsedFiles);
  
  // Combine into output
  const output = {
    files: Object.fromEntries(parsedFiles.map(f => [f.name, f])),
    index
  };
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\nOutput written to: ${OUTPUT_FILE}`);
  console.log(`Total lines: ${index.files.reduce((sum, f) => sum + f.lineCount, 0)}`);
  console.log(`Total markers: ${Object.keys(index.markerToFile).length}`);
}

main();
