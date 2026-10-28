import Markdown from 'react-markdown';

import { ExternalLink } from '@/ui';

// h1/h2 are demoted to h3 so partner headings never emit a second <h1> on the page
// (the page title already owns the h1). Without this they'd unwrap to bare inline text.
const ALLOWED = [
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

export const RichText = ({ markdown }: { markdown: string }) => (
  <Markdown
    allowedElements={ALLOWED}
    unwrapDisallowed
    components={{
      h1: ({ children }) => <h3>{children}</h3>,
      h2: ({ children }) => <h3>{children}</h3>,
      a: ({ href, title, children }) => (
        <ExternalLink href={href ?? '#'} title={title}>
          {children}
        </ExternalLink>
      ),
    }}
  >
    {markdown}
  </Markdown>
);
