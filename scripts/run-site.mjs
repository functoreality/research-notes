#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const readerDir = path.resolve(scriptDir, '..');
const [command, contentRootArg] = process.argv.slice(2);

if (!['dev', 'build'].includes(command) || !contentRootArg) {
  console.error('Usage: npm run site -- <dev|build> <content-directory>');
  process.exit(1);
}

const contentRoot = path.resolve(contentRootArg);
const notesDir = path.join(contentRoot, 'raw');
const publicDir = path.join(contentRoot, 'public');
const homepageFile = path.join(publicDir, 'data', 'homepage.md');
const configFile = path.join(contentRoot, 'site.config.json');

for (const requiredPath of [notesDir, homepageFile, configFile]) {
  if (!fs.existsSync(requiredPath)) {
    console.error(`Required path not found: ${requiredPath}`);
    process.exit(1);
  }
}

const env = {
  ...process.env,
  NOTES_INPUT_DIR: notesDir,
  NOTES_OUTPUT_FILE: path.join(publicDir, 'data', 'notes.json'),
  NOTES_PUBLIC_DIR: publicDir,
  NOTES_SITE_CONFIG: configFile,
};

function run(program, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(program, args, {
      cwd: readerDir,
      env,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`${program} exited with code ${code}`));
    });
  });
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

await run(process.execPath, [path.join(scriptDir, 'parse-notes.mjs')]);
await run(npmCommand, ['run', command]);
