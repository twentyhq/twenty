import { z } from 'zod';

export const expectedOutputSchemaShape = {
  expectedOutputSchema: z
    .union([z.looseObject({}), z.array(z.unknown())])
    .optional()
    .describe(
      'A sample output value declared by the user for steps whose output structure is only known at runtime.',
    ),
};
