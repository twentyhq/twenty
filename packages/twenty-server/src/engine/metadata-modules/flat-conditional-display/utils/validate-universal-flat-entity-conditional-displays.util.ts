import { getUniversalFlatEntityConditionalDisplays } from 'src/engine/metadata-modules/flat-conditional-display/utils/get-universal-flat-entity-conditional-displays.util';
import { validateConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/validate-conditional-display.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type ValidateConditionalDisplayArgs = Parameters<
  typeof validateConditionalDisplay
>[0];

export const validateUniversalFlatEntityConditionalDisplays = ({
  flatEntity,
  ...context
}: {
  flatEntity: {
    universalConditionalDisplay: unknown;
    universalOverrides?: unknown;
  };
} & Omit<
  ValidateConditionalDisplayArgs,
  'conditionalDisplay'
>): FlatEntityValidationError[] =>
  getUniversalFlatEntityConditionalDisplays({
    metadataName: context.surface,
    universalConditionalDisplay: flatEntity.universalConditionalDisplay,
    universalOverrides: flatEntity.universalOverrides,
  }).flatMap((conditionalDisplay) =>
    validateConditionalDisplay({ conditionalDisplay, ...context }),
  );
