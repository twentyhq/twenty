import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildFormulaFieldDescriptors } from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export type FormulaSourceUniversalFlatFieldMetadata = Pick<
  UniversalFlatFieldMetadata,
  | 'name'
  | 'type'
  | 'universalIdentifier'
  | 'universalSettings'
  | 'formula'
  | 'objectMetadataUniversalIdentifier'
  | 'relationTargetObjectMetadataUniversalIdentifier'
>;

export type FormulaSourceUniversalFlatObjectMetadata = Pick<
  UniversalFlatObjectMetadata,
  'universalIdentifier' | 'fieldUniversalIdentifiers'
>;

export const buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps = ({
  universalFlatObjectMetadata,
  universalFlatObjectMetadataMaps,
  universalFlatFieldMetadataMaps,
  pendingUniversalFlatFieldMetadatas = [],
}: {
  universalFlatObjectMetadata: FormulaSourceUniversalFlatObjectMetadata;
  universalFlatObjectMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<string, FormulaSourceUniversalFlatObjectMetadata>
    >;
  };
  universalFlatFieldMetadataMaps: {
    byUniversalIdentifier: Partial<
      Record<string, FormulaSourceUniversalFlatFieldMetadata>
    >;
  };
  // Fields of the same build that are not validated yet, so a formula can read them whatever the order
  pendingUniversalFlatFieldMetadatas?: FormulaSourceUniversalFlatFieldMetadata[];
}): ValidationRuleFieldDescriptor[] => {
  const findUniversalFlatFieldMetadatas = ({
    universalIdentifier,
    fieldUniversalIdentifiers,
  }: FormulaSourceUniversalFlatObjectMetadata) => [
    ...fieldUniversalIdentifiers
      .map(
        (fieldUniversalIdentifier) =>
          universalFlatFieldMetadataMaps.byUniversalIdentifier[
            fieldUniversalIdentifier
          ],
      )
      .filter(isDefined),
    ...pendingUniversalFlatFieldMetadatas.filter(
      ({ objectMetadataUniversalIdentifier }) =>
        objectMetadataUniversalIdentifier === universalIdentifier,
    ),
  ];

  return buildFormulaFieldDescriptors({
    flatFieldMetadatas: findUniversalFlatFieldMetadatas(
      universalFlatObjectMetadata,
    ),
    getSettings: ({ universalSettings }) => universalSettings,
    findRelationTargetFlatFieldMetadatas: ({
      relationTargetObjectMetadataUniversalIdentifier,
    }) => {
      const targetUniversalFlatObjectMetadata = isDefined(
        relationTargetObjectMetadataUniversalIdentifier,
      )
        ? universalFlatObjectMetadataMaps.byUniversalIdentifier[
            relationTargetObjectMetadataUniversalIdentifier
          ]
        : undefined;

      return isDefined(targetUniversalFlatObjectMetadata)
        ? findUniversalFlatFieldMetadatas(targetUniversalFlatObjectMetadata)
        : [];
    },
  });
};
