import { Markdown } from '@/ui';

import { stripLeadingMarkdownTitle } from './strip-leading-markdown-title';

type AppReadmeProps = {
  markdown: string;
};

export function AppReadme({ markdown }: AppReadmeProps) {
  return (
    <Markdown
      headingFloor="h2"
      markdown={stripLeadingMarkdownTitle(markdown)}
    />
  );
}
