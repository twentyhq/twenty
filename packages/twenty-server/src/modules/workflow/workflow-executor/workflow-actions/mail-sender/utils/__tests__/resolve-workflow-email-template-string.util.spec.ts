import { resolveWorkflowEmailTemplateString } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-workflow-email-template-string.util';

const CONTEXT = {
  trigger: {
    id: 'person-1',
    name: '<b>Ada</b>',
    tags: ['engineer', 'writer'],
  },
};

describe('resolveWorkflowEmailTemplateString', () => {
  it('should resolve scalar and object workflow values', () => {
    expect(
      resolveWorkflowEmailTemplateString(
        '{{trigger.id}} {{trigger.tags}}',
        CONTEXT,
        { escapeValues: false },
      ),
    ).toBe('person-1 ["engineer","writer"]');
  });

  it('should escape values inserted into raw HTML', () => {
    expect(
      resolveWorkflowEmailTemplateString('{{trigger.name}}', CONTEXT, {
        escapeValues: true,
      }),
    ).toBe('&lt;b&gt;Ada&lt;/b&gt;');
  });
});
