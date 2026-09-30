import { EMAIL_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

import { convertWorkflowEmailBodiesToEmailDocuments } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/convert-workflow-email-bodies-to-email-documents.util';

const emailStep = (body: string, type = 'SEND_EMAIL') => ({
  id: 'step-1',
  type,
  name: 'Send',
  settings: {
    outputSchema: {},
    input: { connectedAccountId: 'account-1', recipients: {}, body },
  },
});

const convertedBody = (body: string, type?: string) =>
  JSON.parse(
    convertWorkflowEmailBodiesToEmailDocuments([emailStep(body, type)]).value[0]
      .settings.input.body,
  );

describe('convertWorkflowEmailBodiesToEmailDocuments', () => {
  it('should store a legacy HTML body verbatim in an HTML document block', () => {
    expect(convertedBody('<p>Hi {{trigger.name}}</p>')).toEqual({
      type: 'doc',
      attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
      content: [
        {
          type: 'htmlDocument',
          attrs: { html: '<p>Hi {{trigger.name}}</p>' },
        },
      ],
    });
  });

  it('should convert a plain-text draft body into text with variable tags', () => {
    expect(convertedBody('Hi {{trigger.name}}\nBye', 'DRAFT_EMAIL')).toEqual({
      type: 'doc',
      attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hi ' },
            { type: 'variableTag', attrs: { variable: '{{trigger.name}}' } },
            { type: 'hardBreak' },
            { type: 'text', text: 'Bye' },
          ],
        },
      ],
    });
  });

  it('should stamp a versionless document and keep the rest of the step intact', () => {
    const content = [
      { type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] },
    ];
    const { value, hasChanged } = convertWorkflowEmailBodiesToEmailDocuments([
      emailStep(JSON.stringify({ type: 'doc', content })),
    ]);

    expect(hasChanged).toBe(true);
    expect(value[0]).toEqual({
      ...emailStep(''),
      settings: {
        ...emailStep('').settings,
        input: {
          ...emailStep('').settings.input,
          body: JSON.stringify({
            type: 'doc',
            attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
            content,
          }),
        },
      },
    });
  });

  it('should leave canonical, empty, invalid and non-email steps untouched', () => {
    const steps = [
      emailStep(
        JSON.stringify({
          type: 'doc',
          attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
          content: [],
        }),
      ),
      emailStep(''),
      emailStep(JSON.stringify({ type: 'doc', content: [{ type: 'nope' }] })),
      { ...emailStep('<p>Hi</p>'), type: 'CODE' },
    ];

    const result = convertWorkflowEmailBodiesToEmailDocuments(steps);

    expect(result.hasChanged).toBe(false);
    expect(result.value).toBe(steps);
  });

  it('should be a no-op when run a second time', () => {
    const { value } = convertWorkflowEmailBodiesToEmailDocuments([
      emailStep('Hello\nWorld'),
      emailStep('<b>Hi</b>'),
    ]);

    expect(convertWorkflowEmailBodiesToEmailDocuments(value).hasChanged).toBe(
      false,
    );
  });
});
