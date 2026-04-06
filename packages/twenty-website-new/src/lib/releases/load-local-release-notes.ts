import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';

import type { LocalReleaseNote } from '@/lib/releases/types';
import { compareSemanticVersions } from '@/lib/semver/compare-semantic-versions';

function resolveReleasesDirectory(): string | null {
  const candidates = [
    path.join(process.cwd(), '..', 'twenty-website', 'src', 'content', 'releases'),
    path.join(
      process.cwd(),
      '..',
      '..',
      'packages',
      'twenty-website',
      'src',
      'content',
      'releases',
    ),
  ];

  for (const directoryPath of candidates) {
    if (fs.existsSync(directoryPath)) {
      return directoryPath;
    }
  }

  return null;
}

export function loadLocalReleaseNotes(): LocalReleaseNote[] {
  const directoryPath = resolveReleasesDirectory();
  if (!directoryPath) {
    return [];
  }

  const fileNames = fs.readdirSync(directoryPath);
  const notes: LocalReleaseNote[] = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.md') && !fileName.endsWith('.mdx')) {
      continue;
    }

    const fullPath = path.join(directoryPath, fileName);
    const raw = fs.readFileSync(fullPath, 'utf-8');
    const { data, content } = matter(raw);
    const dateValue = data.Date;
    const releaseValue = data.release;
    const date = typeof dateValue === 'string' ? dateValue : '';
    const release = typeof releaseValue === 'string' ? releaseValue : '';

    if (!release) {
      continue;
    }

    notes.push({
      slug: fileName.replace(/\.mdx?$/i, ''),
      date,
      release,
      content,
    });
  }

  notes.sort((a, b) => compareSemanticVersions(b.release, a.release));
  return notes;
}
