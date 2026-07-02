import Markdown from 'react-markdown';

import { ExternalLink } from '@/ui';

const ALLOWED = ['p', 'strong', 'em', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'br'];

export const RichText = ({ markdown }: { markdown: string }) => (
  <Markdown
    allowedElements={ALLOWED}
    unwrapDisallowed
    components={{
      a: ({ href, children }) => (
        <ExternalLink href={href ?? '#'}>{children}</ExternalLink>
      ),
    }}
  >
    {markdown}
  </Markdown>
);
