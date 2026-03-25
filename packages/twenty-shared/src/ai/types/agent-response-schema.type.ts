// Simple agent response schema for AI SDK using JSON Schema format

// Simple primitive types that map to JSON Schema
export type AgentResponseFieldType = 'string' | 'number' | 'boolean';

// Our simplified schema format (flat object with primitives only)
export type AgentResponseSchema = {
  type: 'object';
  properties: Record<
    string,
    {
      type: AgentResponseFieldType;
      description?: string;
    }
  >;
  required?: string[];
  additionalProperties?: false;
};
