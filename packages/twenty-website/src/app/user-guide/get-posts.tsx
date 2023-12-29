import fs from 'fs';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';
import { ReactElement } from 'react';

interface ItemInfo {
  title: string;
  position?: number;
  path: string;
  type: 'file' | 'directory';
}

export interface FileContent {
  content: ReactElement;
  itemInfo: ItemInfo;
}

export interface Directory {
  [key: string]: FileContent | Directory | ItemInfo;
  itemInfo: ItemInfo;
}

const basePath = '/src/content/user-guide';


async function getFiles(filePath: string, position: number = 0): Promise<Directory> {
  const entries = fs.readdirSync(filePath, { withFileTypes: true });

  const urlpath = path.toString().split(basePath);
  const pathName = urlpath.length > 1 ? urlpath[1] : path.basename(filePath);
  console.log(pathName);

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
      directory[entry.name] = await getFiles(path.join(filePath, entry.name), position++);
    } else if (entry.isFile() && path.extname(entry.name) === '.mdx') {
      const fileContent = fs.readFileSync(path.join(filePath, entry.name), 'utf8');
      const { content, frontmatter } = await compileMDX<{ title: string, position?: number }>({ source: fileContent, options: { parseFrontmatter: true } });
      directory[entry.name] = { content, itemInfo: {...frontmatter, type: 'file', path: pathName + "/" +  entry.name.replace(/\.mdx$/, '')} };
    }
  }

  return directory;
}

async function parseFrontMatterAndCategory(directory: Directory, dirPath: string): Promise<Directory> {
  const parsedDirectory: Directory = {
    itemInfo: directory.itemInfo,
  };

  for (const entry in directory) {
    if (entry !== 'itemInfo' && directory[entry] instanceof Object) {
      parsedDirectory[entry] = await parseFrontMatterAndCategory(directory[entry] as Directory, path.join(dirPath, entry));
    }
  }

  const categoryPath = path.join(dirPath, '_category_.json');

  if (fs.existsSync(categoryPath)) {
    const categoryJson: ItemInfo = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
    parsedDirectory.itemInfo = categoryJson;
  }

  return parsedDirectory;
}

export async function getPosts(): Promise<Directory> {
  const postsDirectory = path.join(process.cwd(), basePath);
  const directory = await getFiles(postsDirectory);
  return parseFrontMatterAndCategory(directory, postsDirectory);
}

export async function getPost(slug: string[]): Promise<FileContent | null> {
  const postsDirectory = path.join(process.cwd(), basePath);
  const modifiedSlug = slug.join('/');
  const filePath = path.join(postsDirectory, `${modifiedSlug}.mdx`);

  console.log(filePath);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { content, frontmatter } = await compileMDX<{ title: string, position?: number }>({ source: fileContent, options: { parseFrontmatter: true } });
  
  return { content, itemInfo: {...frontmatter, type: 'file', path: modifiedSlug }};
}
