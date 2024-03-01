import fs from 'fs';
import matter from 'gray-matter';

import { ReleaseNote } from '@/app/releases/api/route';
import { compareSemanticVersions } from '@/shared-utils/compareSemanticVersions';

// WARNING: This API is used by twenty-front, not just by twenty-website
// Make sure you don't change it without updating twenty-front at the same time
export async function getReleases(baseUrl?: string): Promise<ReleaseNote[]> {
  const files = fs.readdirSync('src/content/releases');
  const releasenotes: ReleaseNote[] = [];

  for (const fileName of files) {
    if (!fileName.endsWith('.md') && !fileName.endsWith('.mdx')) {
      continue;
    }
    const file = fs.readFileSync(`src/content/releases/${fileName}`, 'utf-8');
    const { data: frontmatter, content } = matter(file);

    let updatedContent;
    if (baseUrl) {
      updatedContent = content.replace(
        /!\[(.*?)\]\((?!http)(.*?)\)/g,
        (match: string, alt: string, src: string) => {
          // Check if src is a relative path (not starting with http:// or https://)
          if (!src.startsWith('/')) {
            src = `${baseUrl}/${src}`;
          } else {
            src = `${baseUrl}${src}`;
          }
          return `![${alt}](${src})`;
        },
      );
    }

    releasenotes.push({
      slug: fileName.slice(0, -4),
      date: frontmatter.Date,
      release: frontmatter.release,
      content: updatedContent ?? content,
    });
  }

  releasenotes.sort((a, b) => compareSemanticVersions(b.release, a.release));

  return releasenotes;
}
