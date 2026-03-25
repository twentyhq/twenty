import fs from 'fs';
import { compileMDX } from 'next-mdx-remote/rsc';
import path from 'path';
import { type ReactElement } from 'react';
import gfm from 'remark-gfm';

import ArticleEditContent from '@/app/_components/ui/layout/articles/ArticleEditContent';
import ArticleLink from '@/app/_components/ui/layout/articles/ArticleLink';
import ArticlePropsTable from '@/app/_components/ui/layout/articles/ArticlePropsTable';
import ArticleTab from '@/app/_components/ui/layout/articles/ArticleTab';
import ArticleTable from '@/app/_components/ui/layout/articles/ArticleTable';
import ArticleTabs from '@/app/_components/ui/layout/articles/ArticleTabs';
import ArticleWarning from '@/app/_components/ui/layout/articles/ArticleWarning';
import SandpackEditor from '@/app/_components/ui/layout/articles/SandpackEditor';

interface ItemInfo {
  title: string;
  position?: number;
  path: string;
  type: 'file' | 'directory';
  icon?: string;
  info?: string;
  image?: string;
}

export interface FileContent {
  content: ReactElement;
  itemInfo: ItemInfo;
}

export interface Directory {
  [key: string]: FileContent | Directory | ItemInfo;
  itemInfo: ItemInfo;
}

async function getFiles(
  filePath: string,
  basePath: string,
  position = 0,
): Promise<Directory> {
  const entries = fs.readdirSync(filePath, { withFileTypes: true });

  const urlpath = path.toString().split(basePath);
  const pathName = urlpath.length > 1 ? urlpath[1] : path.basename(filePath);

  const directory: Directory = {
    itemInfo: {
      title: path.basename(filePath),
      position,
      type: 'directory',
      path: pathName,
    },
  };

  for (const entry of entries) {
    if (entry.isDirectory()) {
      directory[entry.name] = await getFiles(
        path.join(filePath, entry.name),
        basePath,
        position++,
      );
    } else if (entry.isFile() && path.extname(entry.name) === '.mdx') {
      const { content, frontmatter } = await compileMDXFile(
        path.join(filePath, entry.name),
      );
      directory[entry.name] = {
        content,
        itemInfo: {
          ...frontmatter,
          type: 'file',
          path: pathName + '/' + entry.name.replace(/\.mdx$/, ''),
        },
      };
    }
  }

  return directory;
}

async function parseFrontMatterAndCategory(
  directory: Directory,
  dirPath: string,
): Promise<Directory> {
  const parsedDirectory: Directory = {
    itemInfo: directory.itemInfo,
  };

  for (const entry in directory) {
    if (entry !== 'itemInfo' && directory[entry] instanceof Object) {
      parsedDirectory[entry] = await parseFrontMatterAndCategory(
        directory[entry] as Directory,
        path.join(dirPath, entry),
      );
    }
  }

  const categoryPath = path.join(dirPath, '_category_.json');

  if (fs.existsSync(categoryPath)) {
    const categoryJson: ItemInfo = JSON.parse(
      fs.readFileSync(categoryPath, 'utf8'),
    );
    parsedDirectory.itemInfo = categoryJson;
  }

  return parsedDirectory;
}

export async function compileMDXFile(filePath: string) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const compiled = await compileMDX<{ title: string; position?: number }>({
    source: fileContent,
    components: {
      ArticleWarning(properties) {
        return <ArticleWarning {...properties} />;
      },
      ArticleEditContent(properties) {
        return <ArticleEditContent {...properties} />;
      },
      ArticleLink(properties) {
        return <ArticleLink {...properties} />;
      },
      ArticleTabs(properties) {
        return <ArticleTabs {...properties} />;
      },
      ArticleTab(properties) {
        return <ArticleTab {...properties} />;
      },
      ArticleTable(properties) {
        return <ArticleTable {...properties} />;
      },
      ArticlePropsTable(properties) {
        return <ArticlePropsTable {...properties} />;
      },
      SandpackEditor(properties) {
        return <SandpackEditor {...properties} />;
      },
    },
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        development: process.env.NODE_ENV === 'development',
        remarkPlugins: [gfm],
      },
    },
  });

  return compiled;
}

export async function getPosts(basePath: string): Promise<Directory> {
  const postsDirectory = path.join(process.cwd(), basePath);
  const directory = await getFiles(postsDirectory, basePath);
  return parseFrontMatterAndCategory(directory, postsDirectory);
}

export async function getPost(
  slug: string,
  basePath: string,
): Promise<FileContent | null> {
  const postsDirectory = path.join(process.cwd(), basePath);
  const filePath = path.join(postsDirectory, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }
  const { content, frontmatter } = await compileMDXFile(filePath);
  return {
    content,
    itemInfo: { ...frontmatter, type: 'file', path: slug },
  };
}
