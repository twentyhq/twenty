import { VIEW_GROUP_VISIBLE_OPTIONS_MAX } from 'twenty-shared/constants';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';

export type ViewGroupProperties = Pick<
  UniversalFlatViewGroup,
  'fieldValue' | 'position' | 'isVisible'
>;

export const computeViewGroupPropertiesFromMainGroupByFieldMetadata = ({
  mainGroupByFieldMetadata,
}: {
  mainGroupByFieldMetadata: Pick<
    FlatFieldMetadata | UniversalFlatFieldMetadata,
    'options' | 'isNullable'
  >;
}): ViewGroupProperties[] => {
  const fieldValues = [
    ...(mainGroupByFieldMetadata.options ?? []).map(({ value }) => value),
    ...(mainGroupByFieldMetadata.isNullable === true ? [''] : []),
  ];

  return fieldValues.map((fieldValue, index) => ({
    fieldValue,
    position: index,
    isVisible: index < VIEW_GROUP_VISIBLE_OPTIONS_MAX,
  }));
};
