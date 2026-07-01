import Markdown from 'react-markdown';

const ALLOWED = ['p', 'strong', 'em', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'br'];

export const RichText = ({ markdown }: { markdown: string }) => (
  <Markdown
    allowedElements={ALLOWED}
    unwrapDisallowed
    components={{
      a: ({ href, children }) => (
        <a href={href ?? '#'} target="_blank" rel="noopener nofollow">
          {children}
        </a>
      ),
    }}
  >
    {markdown}
  </Markdown>
);
