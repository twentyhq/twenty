import { ROLLUP_AGGREGATE_OPERATIONS } from 'twenty-shared/constants';
import { z } from 'zod';

import { viewFieldRelationScopeSchema } from 'src/engine/metadata-modules/view-field/tools/schemas/view-field-relation-scope.schema';

export const ROLLUP_MAX_DECIMALS = 10;

export const rollupSettingsInputSchema = z.object({
  relationFieldMetadataId: z.uuid(),
  aggregateOperation: z.enum(ROLLUP_AGGREGATE_OPERATIONS),
  aggregatedFieldMetadataId: z.uuid().nullish(),
  filters: viewFieldRelationScopeSchema.shape.filters,
  filterGroups: viewFieldRelationScopeSchema.shape.filterGroups,
  decimals: z.number().int().min(0).max(ROLLUP_MAX_DECIMALS).optional(),
});

export type RollupSettingsInput = z.infer<typeof rollupSettingsInputSchema>;
