import manifest from '../../data/images-manifest.json';
import { slugify } from '../slug';
import type { ResolvedImage } from '../types';
import { probeImage } from './probe';

const MAP = manifest as Record<string, string[]>;

export async function resolveLocal(category: string, word: string): Promise<ResolvedImage | null> {
  const key = `${category}/${slugify(word)}`;
  const files = MAP[key];
  if (!files || files.length === 0) return null;
  const shuffled = [...files].sort(() => Math.random() - 0.5);
  for (const file of shuffled) {
    const url = `/images/${key}/${file}`;
    if (await probeImage(url)) {
      return { url, source: 'local' };
    }
  }
  return null;
}
