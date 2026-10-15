import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { pickMorphRelationRepresentative } from 'src/engine/metadata-modules/flat-field-metadata/utils/pick-morph-relation-representative.util';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';

type MorphRelationField = FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;

export const findLegacyMorphRelationRepresentative = (
  targets: MorphRelationField[],
): MorphRelationField | undefined => {
  const representative = pickMorphRelationRepresentative({
    morphFlatFieldMetadatas: targets.map((target) =>
      resolveEffectiveFlatEntity({
        metadataName: 'fieldMetadata',
        flatEntity: target,
      }),
    ),
    isMorphRelationHeadEnabled: false,
  });

  return targets.find((target) => target.id === representative?.id);
};
