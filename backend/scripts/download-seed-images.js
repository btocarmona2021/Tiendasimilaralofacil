import { mkdirSync, existsSync, createWriteStream } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { seeds } from '../src/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const imagesDir = resolve(__dirname, '../seed-assets/images');

if (!existsSync(imagesDir)) {
  mkdirSync(imagesDir, { recursive: true });
}

async function download(url, filepath) {
  if (existsSync(filepath)) return;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const buffer = Buffer.from(await resp.arrayBuffer());
    createWriteStream(filepath).write(buffer);
    console.log(`  ✓ ${filepath.split('/').pop()}`);
  } catch (err) {
    console.error(`  ✗ ${filepath.split('/').pop()} — ${err.message}`);
  }
}

async function main() {
  const all = [];
  for (const [rubro, data] of Object.entries(seeds)) {
    for (const p of data.products) {
      const slug = p.name.replace(/\s+/g, '-').toLowerCase();
      all.push({ name: p.name, slug, rubro });
    }
  }

  let done = 0;
  const total = all.length;
  console.log(`Descargando ${total} imágenes desde picsum.photos...\n`);

  // Download in batches of 5 to be nice to the server
  const batchSize = 5;
  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize);
    await Promise.all(batch.map(item => {
      const url = `https://picsum.photos/seed/${encodeURIComponent(item.slug)}/400/400`;
      const filepath = resolve(imagesDir, `${item.slug}.jpg`);
      return download(url, filepath);
    }));
    done += batch.length;
    console.log(`Progreso: ${done}/${total}`);
  }

  console.log('\n¡Descarga completada!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
