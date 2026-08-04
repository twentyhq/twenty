import { transformEmailDocumentStrings } from '../transform-email-document-strings';

describe('transformEmailDocumentStrings', () => {
  it('should transform every supported string location with its context', () => {
    const contexts: string[] = [];
    const document = transformEmailDocumentStrings(
      {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'variableTag', attrs: { variable: '{{name}}' } },
              {
                type: 'text',
                text: 'Profile',
                marks: [{ type: 'link', attrs: { href: '/people/{{id}}' } }],
              },
            ],
          },
          {
            type: 'image',
            attrs: {
              src: '/images/{{id}}',
              href: '/people/{{id}}',
              alt: '{{name}}',
              title: '{{name}}',
            },
          },
          { type: 'html', attrs: { html: '<p>{{name}}</p>' } },
        ],
      },
      (value, context) => {
        contexts.push(context);
        return `[${context}]${value}`;
      },
    );

    expect(document.content?.[0].content?.[0].attrs?.variable).toBe(
      '[text]{{name}}',
    );
    expect(
      (
        document.content?.[0].content?.[1].marks?.[0] as {
          attrs: { href: string };
        }
      ).attrs.href,
    ).toBe('[url]/people/{{id}}');
    expect(document.content?.[1].attrs).toEqual({
      src: '[url]/images/{{id}}',
      href: '[url]/people/{{id}}',
      alt: '[text]{{name}}',
      title: '[text]{{name}}',
    });
    expect(document.content?.[2].attrs?.html).toBe('[html]<p>{{name}}</p>');
    expect(contexts).toContain('html');
    expect(contexts).toContain('text');
    expect(contexts).toContain('url');
  });
});
