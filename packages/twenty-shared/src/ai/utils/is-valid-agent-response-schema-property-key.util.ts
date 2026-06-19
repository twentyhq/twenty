const AGENT_RESPONSE_SCHEMA_PROPERTY_KEY_PATTERN = /^[a-zA-Z0-9_.-]{1,64}$/;

export const isValidAgentResponseSchemaPropertyKey = (
  propertyKey: string,
): boolean => AGENT_RESPONSE_SCHEMA_PROPERTY_KEY_PATTERN.test(propertyKey);
