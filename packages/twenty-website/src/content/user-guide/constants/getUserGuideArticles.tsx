import fs from 'fs';
import matter from 'gray-matter';

import { USER_GUIDE_INDEX } from '@/content/user-guide/constants/UserGuideIndex';

export interface UserGuideArticlesProps {
  title: string;
  info: string;
  image: string;
  fileName: string;
  topic: string;
}

export function getUserGuideArticles() {
  const guides: UserGuideArticlesProps[] = [];

  for (const [topic, files] of Object.entries(USER_GUIDE_INDEX)) {
    files.forEach(({ fileName }) => {
      const filePath = `src/content/user-guide/${fileName}.mdx`;
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter } = matter(fileContent);

        guides.push({
          title: frontmatter.title || '',
          info: frontmatter.info || '',
          image: frontmatter.image || '',
          fileName: fileName,
          topic: topic,
        });
      }
    });
  }

  return guides;
}
