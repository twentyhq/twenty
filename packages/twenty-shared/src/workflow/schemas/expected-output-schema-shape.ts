import { z } from 'zod';

export const expectedOutputSchemaShape = {
  expectedOutputSchema: z
    .looseObject({})
    .optional()
    .describe(
      'A sample output value declared by the user for steps whose output structure is only known at runtime.',
    ),
};
