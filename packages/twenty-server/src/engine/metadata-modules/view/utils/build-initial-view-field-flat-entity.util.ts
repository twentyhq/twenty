import { getViewFieldUniversalIdentifier } from 'twenty-shared/application';

import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const buildInitialViewFieldFlatEntity = ({
  applicationUniversalIdentifier,
  initialViewUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
  isVisible,
  size,
  position,
  aggregateOperation,
  isActive,
  createdAt,
}: Pick<
  UniversalFlatViewField,
  | 'applicationUniversalIdentifier'
  | 'fieldMetadataUniversalIdentifier'
  | 'isVisible'
  | 'size'
  | 'position'
  | 'aggregateOperation'
  | 'isActive'
> & {
  initialViewUniversalIdentifier: string;
  createdAt: string;
}): UniversalFlatViewField => ({
  fieldMetadataUniversalIdentifier,
  viewUniversalIdentifier: initialViewUniversalIdentifier,
  viewFieldGroupUniversalIdentifier: null,
  createdAt,
  updatedAt: createdAt,
  deletedAt: null,
  universalIdentifier: getViewFieldUniversalIdentifier({
    applicationUniversalIdentifier,
    viewUniversalIdentifier: initialViewUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
  }),
  isVisible,
  size,
  position,
  aggregateOperation,
  isActive,
  isSystemSideEffect: false,
  universalOverrides: null,
  applicationUniversalIdentifier,
});
