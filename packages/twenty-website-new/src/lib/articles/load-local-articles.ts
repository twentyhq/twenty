import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';

import type { Article } from './types';

const WORDS_PER_MINUTE = 220;

type ArticleFrontmatter = {
  author?: unknown;
  date?: unknown;
  description?: unknown;
  draft?: unknown;
  slug?: unknown;
  tags?: unknown;
  title?: unknown;
};

const ARTICLES_DIRECTORY_CANDIDATES = [
  path.join(process.cwd(), 'src', 'content', 'articles'),
  path.join(
    process.cwd(),
    'packages',
    'twenty-website-new',
    'src',
    'content',
    'articles',
  ),
];

function resolveArticlesDirectory(): string | null {
  for (const directoryPath of ARTICLES_DIRECTORY_CANDIDATES) {
    if (fs.existsSync(directoryPath)) {
      return directoryPath;
    }
  }

  return null;
}

function normalizeDate(value: unknown, fileName: string): string {
  if (typeof value === 'string' && value.trim()) {
    if (Number.isNaN(new Date(value).getTime())) {
      throw new Error(`Article "${fileName}" has invalid date "${value}".`);
    }

    return value;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  throw new Error(`Article "${fileName}" is missing a valid date.`);
}

function requireString(
  value: unknown,
  fieldName: keyof Pick<Article, 'description' | 'title'>,
  fileName: string,
): string {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  throw new Error(`Article "${fileName}" is missing "${fieldName}".`);
}

function normalizeTags(value: unknown, fileName: string): readonly string[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error(`Article "${fileName}" has invalid "tags".`);
  }

  if (!value.every((tag) => typeof tag === 'string' && tag.trim())) {
    throw new Error(`Article "${fileName}" has invalid "tags".`);
  }

  return value.map((tag) => {
    if (typeof tag !== 'string') {
      throw new Error(`Article "${fileName}" has invalid "tags".`);
    }

    return tag.trim();
  });
}

function normalizeSlug(value: unknown, fileName: string): string {
  const slug =
    typeof value === 'string' && value.trim()
      ? value
      : fileName.replace(/\.mdx?$/i, '');

  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return slug;
  }

  throw new Error(
    `Article "${fileName}" has invalid slug "${slug}". Use lowercase kebab-case.`,
  );
}

function calculateReadingTimeMinutes(content: string): number {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

function parseArticle(fileName: string, raw: string): Article {
  const { content, data } = matter(raw);
  const frontmatter = data as ArticleFrontmatter;

  return {
    author:
      typeof frontmatter.author === 'string' && frontmatter.author.trim()
        ? frontmatter.author
        : 'Twenty',
    content,
    date: normalizeDate(frontmatter.date, fileName),
    description: requireString(
      frontmatter.description,
      'description',
      fileName,
    ),
    draft: frontmatter.draft === true,
    readingTimeMinutes: calculateReadingTimeMinutes(content),
    slug: normalizeSlug(frontmatter.slug, fileName),
    tags: normalizeTags(frontmatter.tags, fileName),
    title: requireString(frontmatter.title, 'title', fileName),
  };
}

export function loadLocalArticlesFromDirectory(
  directoryPath: string,
): Article[] {
  const articles = fs
    .readdirSync(directoryPath)
    .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map((fileName) => {
      const raw = fs.readFileSync(path.join(directoryPath, fileName), 'utf-8');

      return parseArticle(fileName, raw);
    });

  articles.sort((article, other) => other.date.localeCompare(article.date));

  return articles;
}

let cachedArticles: Article[] | null = null;

export function loadLocalArticles(): Article[] {
  if (cachedArticles !== null) {
    return cachedArticles;
  }

  const directoryPath = resolveArticlesDirectory();
  cachedArticles = directoryPath
    ? loadLocalArticlesFromDirectory(directoryPath)
    : [];

  return cachedArticles;
}

export function getPublishedArticles(): Article[] {
  return loadLocalArticles().filter((article) => !article.draft);
}

export function getPublishedArticle(slug: string): Article | null {
  return (
    getPublishedArticles().find((article) => article.slug === slug) ?? null
  );
}
