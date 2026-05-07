import { MarkdownProse } from '@/design-system/components/MarkdownProse';

type ReleaseMarkdownProps = {
  markdown: string;
};

export function ReleaseMarkdown({ markdown }: ReleaseMarkdownProps) {
  return <MarkdownProse markdown={markdown} />;
}
