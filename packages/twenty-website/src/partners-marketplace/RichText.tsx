import { Markdown, type MarkdownSize } from '@/ui';

const PARTNER_RICH_TEXT_ELEMENTS = [
  'p',
  'strong',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'a',
  'br',
  'code',
  'pre',
];

type RichTextProps = {
  className?: string;
  markdown: string;
  size?: MarkdownSize;
};

export const RichText = ({ className, markdown, size }: RichTextProps) => (
  <Markdown
    allowedElements={PARTNER_RICH_TEXT_ELEMENTS}
    className={className}
    headingFloor="h3"
    markdown={markdown}
    size={size}
  />
);
