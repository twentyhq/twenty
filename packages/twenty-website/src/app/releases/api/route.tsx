import { compareSemanticVersions } from '@/shared-utils/compareSemanticVersions';
import fs from 'fs';
import matter from 'gray-matter';

import { NextRequest, NextResponse } from 'next/server'


export interface ReleaseNote {
  slug: string;
  date: string;
  release: string;
  content: string;
}


const BASE_URL = 'https://twenty.com/';

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
    if(baseUrl) {
           updatedContent = content.replace(/!\[(.*?)\]\((?!http)(.*?)\)/g, (match, alt, src) => {
            // Check if src is a relative path (not starting with http:// or https://)
            if (!src.startsWith('/')) {
              src = `${baseUrl}/${src}`;
            } else {
              src = `${baseUrl}${src}`;
            }
            return `![${alt}](${src})`;
          });
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


export async function GET(request: NextRequest) {

  const host = request.nextUrl.hostname;
  const protocol = request.nextUrl.protocol;
  const baseUrl = `${protocol}//${host}`;
  
  console.log(baseUrl);

  return NextResponse.json(await getReleases(baseUrl), { status: 200 })
}
