// Anthropic rejects tool input_schema property keys that do not match this
// pattern (e.g. keys containing spaces or longer than 64 characters), which
// surfaces as an opaque model error at workflow run time. AI agent output field
// names become these property keys, so they must satisfy the same constraint.
const AGENT_RESPONSE_SCHEMA_PROPERTY_KEY_PATTERN = /^[a-zA-Z0-9_.-]{1,64}$/;

export const isValidAgentResponseSchemaPropertyKey = (
  propertyKey: string,
): boolean => AGENT_RESPONSE_SCHEMA_PROPERTY_KEY_PATTERN.test(propertyKey);
