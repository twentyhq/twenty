import fs from 'fs';
import matter from 'gray-matter';

export interface ReleaseNote {
  slug: string;
  date: string;
  release: string;
  content: string;
}

function compareSemanticVersions(a: string, b: string) {
  const a1 = a.split('.');
  const b1 = b.split('.');

  const len = Math.min(a1.length, b1.length);

  for (let i = 0; i < len; i++) {
    const a2 = +a1[i] || 0;
    const b2 = +b1[i] || 0;

    if (a2 !== b2) {
      return a2 > b2 ? 1 : -1;
    }
  }
  return b1.length - a1.length;
}

export async function getReleases(): Promise<ReleaseNote[]> {
  const files = fs.readdirSync('src/content/releases');
  const releasenotes: ReleaseNote[] = [];

  for (const fileName of files) {
    if (!fileName.endsWith('.md') && !fileName.endsWith('.mdx')) {
      continue;
    }
    const file = fs.readFileSync(`src/content/releases/${fileName}`, 'utf-8');
    const { data: frontmatter, content } = matter(file);
    releasenotes.push({
      slug: fileName.slice(0, -4),
      date: frontmatter.Date,
      release: frontmatter.release,
      content: content,
    });
  }

  releasenotes.sort((a, b) => compareSemanticVersions(b.release, a.release));

  return releasenotes;
}
