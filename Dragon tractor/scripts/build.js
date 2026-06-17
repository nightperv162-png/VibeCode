import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG } from '../src/config.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, CONFIG.diagnostics.buildOutputFolder);

async function listFiles(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(folder, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function copyFolder(source, destination) {
  await mkdir(destination, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = join(source, entry.name);
    const destinationPath = join(destination, entry.name);
    if (entry.isDirectory()) {
      await copyFolder(sourcePath, destinationPath);
    } else {
      await mkdir(dirname(destinationPath), { recursive: true });
      await copyFile(sourcePath, destinationPath);
    }
  }
}

async function assertHtmlIsCanvasContainerOnly() {
  const html = await readFile(join(root, 'index.html'), 'utf8');
  const found = CONFIG.diagnostics.forbiddenHtmlMarkers.filter((marker) => html.toLowerCase().includes(marker));
  if (found.length) {
    throw new Error(`HTML must stay a pure Canvas container. Found: ${found.join(', ')}`);
  }
}

async function syntaxCheckJavaScript() {
  const srcFiles = await listFiles(join(root, 'src'));
  const scriptFiles = await listFiles(join(root, 'scripts'));
  const testFiles = await listFiles(join(root, 'test')).catch(() => []);
  const jsFiles = [...srcFiles, ...scriptFiles, ...testFiles].filter((file) => file.endsWith('.js'));
  for (const file of jsFiles) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== CONFIG.process.successStatus) {
      throw new Error(`Syntax check failed for ${relative(root, file)}\n${result.stderr}`);
    }
  }
}

async function build() {
  await assertHtmlIsCanvasContainerOnly();
  await syntaxCheckJavaScript();
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await copyFile(join(root, 'index.html'), join(dist, 'index.html'));
  await copyFolder(join(root, 'src'), join(dist, 'src'));
  await writeFile(join(dist, CONFIG.diagnostics.buildMarkerFile), `${CONFIG.meta.title} ${CONFIG.meta.version} build passed.\n`);
  console.log(`${CONFIG.logging.prefix} Build complete: ${relative(root, dist)}`);
}

build().catch((error) => {
  console.error(`${CONFIG.logging.prefix} Build failed`, error);
  process.exitCode = CONFIG.process.failureStatus;
});
