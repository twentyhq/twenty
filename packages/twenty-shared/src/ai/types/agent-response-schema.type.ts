// Simple agent response schema for AI SDK
// Type should be FieldMetadataType enum values (TEXT, NUMBER, BOOLEAN, DATE, etc.)
export type AgentResponseSchema = Record<
  string,
  {
    type: string;
    description?: string;
  }
>;

