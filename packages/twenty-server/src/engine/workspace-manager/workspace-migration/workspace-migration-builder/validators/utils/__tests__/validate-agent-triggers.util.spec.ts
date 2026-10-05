import { type AgentTrigger } from 'twenty-shared/application';

import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { validateAgentTriggers } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-agent-triggers.util';

const DATABASE_EVENT_TRIGGER: AgentTrigger = {
  id: '6f1b5a3e-3c3f-4f4a-9a43-0a7f5d6c2b11',
  type: 'DATABASE_EVENT',
  isActive: true,
  instructions: 'Enrich the new company',
  settings: { eventName: 'company.created' },
};

const CRON_TRIGGER: AgentTrigger = {
  id: '0d2b1a8c-77a4-4e2e-8f0c-3a8e9f6b4c22',
  type: 'CRON',
  isActive: true,
  instructions: null,
  settings: { pattern: '0 9 * * 1' },
};

describe('validateAgentTriggers', () => {
  it('should accept an empty list', () => {
    expect(validateAgentTriggers({ triggers: [] })).toEqual([]);
  });

  it('should accept valid database event and cron triggers', () => {
    expect(
      validateAgentTriggers({
        triggers: [DATABASE_EVENT_TRIGGER, CRON_TRIGGER],
      }),
    ).toEqual([]);
  });

  it('should accept watched fields on an updated event', () => {
    expect(
      validateAgentTriggers({
        triggers: [
          {
            ...DATABASE_EVENT_TRIGGER,
            type: 'DATABASE_EVENT',
            settings: {
              eventName: 'opportunity.updated',
              updatedFields: ['stage'],
            },
          },
        ],
      }),
    ).toEqual([]);
  });

  it.each([
    ['a wildcard object', '*.created'],
    ['a wildcard action', 'company.*'],
    ['an unknown action', 'company.archived'],
    ['a missing action', 'company'],
  ])('should reject %s in the event name', (_, eventName) => {
    const errors = validateAgentTriggers({
      triggers: [
        {
          ...DATABASE_EVENT_TRIGGER,
          type: 'DATABASE_EVENT',
          settings: { eventName },
        },
      ],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(AiExceptionCode.INVALID_AGENT_INPUT);
  });

  it('should reject watched fields on a non-update event', () => {
    const errors = validateAgentTriggers({
      triggers: [
        {
          ...DATABASE_EVENT_TRIGGER,
          type: 'DATABASE_EVENT',
          settings: { eventName: 'company.created', updatedFields: ['name'] },
        },
      ],
    });

    expect(errors).toHaveLength(1);
  });

  it('should reject an invalid cron pattern', () => {
    const errors = validateAgentTriggers({
      triggers: [
        {
          ...CRON_TRIGGER,
          type: 'CRON',
          settings: { pattern: 'every monday' },
        },
      ],
    });

    expect(errors).toHaveLength(1);
  });

  it('should reject an unknown trigger type', () => {
    const errors = validateAgentTriggers({
      triggers: [
        {
          ...CRON_TRIGGER,
          type: 'WEBHOOK',
        },
      ],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('DATABASE_EVENT, CRON');
  });

  it('should reject a trigger id that is not a UUID', () => {
    const errors = validateAgentTriggers({
      triggers: [{ ...CRON_TRIGGER, id: 'weekly-digest' }],
    });

    expect(errors).toHaveLength(1);
  });

  it('should reject duplicated trigger ids', () => {
    const errors = validateAgentTriggers({
      triggers: [CRON_TRIGGER, CRON_TRIGGER],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('unique');
  });

  it('should reject a missing isActive flag', () => {
    const errors = validateAgentTriggers({
      triggers: [{ ...CRON_TRIGGER, isActive: undefined }],
    });

    expect(errors).toHaveLength(1);
  });

  it('should reject instructions that are too long', () => {
    const errors = validateAgentTriggers({
      triggers: [{ ...CRON_TRIGGER, instructions: 'a'.repeat(10_001) }],
    });

    expect(errors).toHaveLength(1);
  });

  it('should reject more triggers than an agent can have', () => {
    const triggers = Array.from({ length: 21 }, (_, index) => ({
      ...CRON_TRIGGER,
      id: `0d2b1a8c-77a4-4e2e-8f0c-${String(index).padStart(12, '0')}`,
    }));

    const errors = validateAgentTriggers({ triggers });

    expect(errors).toHaveLength(1);
  });

  it('should reject a missing list', () => {
    const errors = validateAgentTriggers({ triggers: null });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('must be a list');
  });

  it('should report a null trigger without throwing', () => {
    const errors = validateAgentTriggers({ triggers: [null, CRON_TRIGGER] });

    expect(errors).toHaveLength(1);
  });
});
