import { isObject } from '@sniptt/guards';

export const hasWorkflowOutputSchema = (
  settings:
    | { outputSchema?: unknown; expectedOutputSchema?: unknown }
    | null
    | undefined,
): boolean => {
  const expectedOutputSchema = settings?.expectedOutputSchema;

  if (
    isObject(expectedOutputSchema) &&
    Object.keys(expectedOutputSchema).length > 0
  ) {
    return true;
  }

  const outputSchema = settings?.outputSchema;

  return (
    isObject(outputSchema) &&
    Object.keys(outputSchema).length > 0 &&
    !(
      '_outputSchemaType' in outputSchema &&
      outputSchema._outputSchemaType === 'LINK'
    )
  );
};
