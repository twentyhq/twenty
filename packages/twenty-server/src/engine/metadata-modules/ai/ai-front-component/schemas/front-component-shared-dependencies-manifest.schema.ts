import { z } from 'zod';

export const frontComponentSharedDependenciesManifestSchema = z.object({
  checksum: z.string().regex(/^[a-f0-9]{64}$/),
  exports: z.record(
    z.string(),
    z.object({
      namedExports: z.array(z.string()),
      hasDefaultExport: z.boolean(),
    }),
  ),
});
