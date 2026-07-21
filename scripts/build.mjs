import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'public');

const excludedEntries = new Set([
  '.git',
  '.vscode',
  'node_modules',
  'public',
  'deploy.zip',
  'export.zip',
  'export (1).zip',
  'desktop.ini'
]);

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await cp(projectRoot, outputDir, {
  recursive: true,
  filter(source) {
    const relativePath = path.relative(projectRoot, source);

    if (!relativePath) {
      return true;
    }

    const topLevelName = relativePath.split(path.sep)[0];
    return !excludedEntries.has(topLevelName);
  }
});

console.log('Static site build complete');