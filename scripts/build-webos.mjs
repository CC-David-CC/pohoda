import { build } from 'esbuild';
import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const path = name => new URL(`../${name}`, import.meta.url);
await mkdir(path('dist'), { recursive: true });

// These are source styles, not a second independently maintained theme system.
// Shadow DOM isolates selectors; container queries make each desktop window responsive.
const upstream = (await Promise.all(['app/globals.css', 'app/weather.css'].map(name => readFile(path(name), 'utf8')))).join('\n');
const css = upstream
  .replace(/:root\b|\bhtml\b/g, '.pohoda-root')
  .replace(/\bbody\b(?=\s*\{)/g, '.pohoda-scroll')
  .replace(/@media\s*\((min|max)-width:\s*([^)]+)\)/g, '@container pohoda ($1-width: $2)')
  .replace(/(\d*\.?\d+)d?vh\b/g, '$1cqh')
  .replace(/(\d*\.?\d+)vw\b/g, '$1cqw')
  // A rem normally resolves against WebOS's document root, outside the shadow tree.
  .replace(/(\d*\.?\d+)rem\b/g, (_, number) => `${Number((Number(number) * 16).toFixed(4))}px`)
  + `\n:host { all: initial; display: block; height: 100%; width: 100%; }
.pohoda-root { position: absolute; inset: 0; overflow: hidden; contain: layout paint size; container: pohoda / size; font: 16px/1.5 var(--font-sans); color: var(--text); background: var(--bg); }
.pohoda-scroll { position: absolute; inset: 0; min-height: 0; overflow: auto; overscroll-behavior: contain; }
.pohoda-portals { position: absolute; inset: 0; z-index: 100; pointer-events: none; }
.pohoda-portals > * { pointer-events: auto; }
`;

await build({
  absWorkingDir: root,
  entryPoints: ['webos/entry.tsx'],
  outfile: 'dist/pohoda.mjs',
  bundle: true, format: 'esm', platform: 'browser', target: ['chrome120'],
  jsx: 'automatic', minify: true, legalComments: 'linked',
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [{ name: 'pohoda-styles', setup(build) {
    build.onResolve({ filter: /^pohoda:styles$/ }, () => ({ path: 'pohoda:styles', namespace: 'pohoda' }));
    build.onLoad({ filter: /.*/, namespace: 'pohoda' }, () => ({ contents: css, loader: 'text' }));
  } }],
});
await writeFile(path('dist/pohoda.css'), css);
await copyFile(path('LICENSE'), path('dist/LICENSE'));
const licenses = await Promise.all(['react', 'react-dom', 'scheduler'].map(async name => `=== ${name} ===\n${await readFile(path(`node_modules/${name}/LICENSE`), 'utf8')}`));
await writeFile(path('dist/THIRD_PARTY_LICENSES.txt'), licenses.join('\n\n')); 
console.log('Built dist/pohoda.mjs (React + application + isolated CSS included).');
