import fs from 'fs';
import matter from 'gray-matter';

import { DOCS_INDEX } from '@/content/docs/constants/GettingStartedIndex';
import { USER_GUIDE_INDEX } from '@/content/user-guide/constants/UserGuideIndex';

export interface UserGuideArticlesProps {
  title: string;
  info: string;
  image: string;
  fileName: string;
  topic: string;
  numberOfFiles: number;
}

export function getUserGuideArticles(basePath: string) {
  const guides: UserGuideArticlesProps[] = [];
  const index = basePath.includes('docs') ? DOCS_INDEX : USER_GUIDE_INDEX;

  for (const [topic, files] of Object.entries(index)) {
    files.forEach(({ fileName }) => {
      const filePath = `${basePath}${fileName}.mdx`;
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter } = matter(fileContent);

        guides.push({
          title: frontmatter.title || '',
          info: frontmatter.info || '',
          image: frontmatter.image || '',
          fileName: fileName,
          topic: topic,
          numberOfFiles: files.length,
        });
      }
    });
  }

  return guides;
}
