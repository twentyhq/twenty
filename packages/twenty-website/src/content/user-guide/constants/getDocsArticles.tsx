import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

import { DOCS_INDEX } from '@/content/developers/constants/DocsIndex';
import { TWENTY_UI_INDEX } from '@/content/twenty-ui/constants/TwentyUiIndex';
import { USER_GUIDE_INDEX } from '@/content/user-guide/constants/UserGuideIndex';

export interface DocsArticlesProps {
  title: string;
  info: string;
  image: string;
  fileName: string;
  topic: string;
  section: string;
  sectionInfo: string;
  numberOfFiles: number;
}

export function getDocsArticles(basePath: string, isSideBar = false) {
  const guides: DocsArticlesProps[] = [];
  const index = basePath.includes('developers')
    ? DOCS_INDEX
    : basePath.includes('user-guide')
      ? USER_GUIDE_INDEX
      : TWENTY_UI_INDEX;

  const findFileRecursively = (
    directory: string,
    fileName: string,
  ): string | null => {
    const files = fs.readdirSync(directory);

    for (const file of files) {
      const fullPath = path.join(directory, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const nestedResult = findFileRecursively(fullPath, fileName);
        if (nestedResult) {
          return nestedResult;
        }
      } else if (stat.isFile() && path.basename(fullPath) === fileName) {
        return fullPath;
      }
    }

    return null;
  };

  const processFiles = (
    section: string,
    topic: string,
    files: { fileName: string }[],
  ): void => {
    if (files.length === 0) {
      guides.push({
        title: '',
        info: '',
        image: '',
        fileName: '',
        topic: topic,
        section: section,
        sectionInfo: '',
        numberOfFiles: 0,
      });
      return;
    }
    files.forEach(({ fileName }) => {
      let filePath;
      if (isSideBar) {
        const nestedPath = findFileRecursively(basePath, `${fileName}.mdx`);
        const directPath = `${basePath}${fileName}.mdx`;
        filePath = nestedPath || directPath;
      } else {
        filePath = `${basePath}${fileName}.mdx`;
      }
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter } = matter(fileContent);

        guides.push({
          title: frontmatter.title || '',
          info: frontmatter.info || '',
          image: frontmatter.image || '',
          fileName: fileName,
          topic: topic,
          section: section,
          sectionInfo: frontmatter.sectionInfo || '',
          numberOfFiles: files.length,
        });
      }
    });
  };

  for (const [mainTopic, subTopics] of Object.entries(index)) {
    if (typeof subTopics === 'object' && !Array.isArray(subTopics)) {
      for (const [subTopic, files] of Object.entries(subTopics)) {
        processFiles(mainTopic, subTopic, files as { fileName: string }[]);
      }
    } else {
      processFiles(mainTopic, mainTopic, subTopics);
    }
  }

  return guides;
}
