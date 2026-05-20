export type Article = {
  author: string;
  content: string;
  date: string;
  description: string;
  draft: boolean;
  readingTimeMinutes: number;
  slug: string;
  tags: readonly string[];
  title: string;
};
