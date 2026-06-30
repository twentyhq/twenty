import { type AgentResponseFormat } from 'src/engine/metadata-modules/ai/ai-agent/types/agent-response-format.type';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { validateAgentResponseFormat } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-agent-response-format.util';

type JsonResponseFormat = Extract<AgentResponseFormat, { type: 'json' }>;

const buildJsonFormat = (
  properties: JsonResponseFormat['schema']['properties'],
): AgentResponseFormat => ({
  type: 'json',
  schema: {
    type: 'object',
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  },
});

describe('validateAgentResponseFormat', () => {
  it('should return no error for a text response format', () => {
    const errors = validateAgentResponseFormat({
      responseFormat: { type: 'text' },
    });

    expect(errors).toEqual([]);
  });

  it('should return no error when all property names are valid', () => {
    const errors = validateAgentResponseFormat({
      responseFormat: buildJsonFormat({
        meetings_brief: { type: 'string' },
        count: { type: 'number' },
      }),
    });

    expect(errors).toEqual([]);
  });

  it('should return an error when a property name contains a space', () => {
    const errors = validateAgentResponseFormat({
      responseFormat: buildJsonFormat({
        'meetings brief': { type: 'string' },
      }),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(AiExceptionCode.INVALID_AGENT_INPUT);
    expect(errors[0].message).toContain('meetings brief');
  });

  it('should return an error when a property name exceeds 64 characters', () => {
    const errors = validateAgentResponseFormat({
      responseFormat: buildJsonFormat({
        ['a'.repeat(65)]: { type: 'string' },
      }),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(AiExceptionCode.INVALID_AGENT_INPUT);
  });

  it('should not throw when a json schema is missing its properties', () => {
    // Legacy or API-provided data can omit properties despite the type
    const malformedFormat = {
      type: 'json',
      schema: { type: 'object' },
    } as AgentResponseFormat;

    expect(() =>
      validateAgentResponseFormat({ responseFormat: malformedFormat }),
    ).not.toThrow();
    expect(
      validateAgentResponseFormat({ responseFormat: malformedFormat }),
    ).toEqual([]);
  });

  it('should report every invalid property name at once', () => {
    const errors = validateAgentResponseFormat({
      responseFormat: buildJsonFormat({
        'meetings brief': { type: 'string' },
        'sales rep': { type: 'string' },
      }),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('meetings brief');
    expect(errors[0].message).toContain('sales rep');
  });
});
