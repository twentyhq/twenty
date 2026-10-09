import { type FieldManifest } from '@/application/fieldManifestType';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { isMorphRelationGroup } from '@/utils/isMorphRelationGroup';

const getTargetIdentifiers = (
  field: FieldManifest<FieldMetadataType.MORPH_RELATION>,
): string[] | null => {
  if (isMorphRelationGroup(field)) {
    const fieldIdentifier: null =
      field.relationTargetFieldMetadataUniversalIdentifier;
    const objectIdentifier: null =
      field.relationTargetObjectMetadataUniversalIdentifier;

    expect([fieldIdentifier, objectIdentifier]).toEqual([null, null]);

    return null;
  }

  const targetIdentifiers: string[] = [
    field.relationTargetFieldMetadataUniversalIdentifier,
    field.relationTargetObjectMetadataUniversalIdentifier,
  ];

  return targetIdentifiers;
};

describe('isMorphRelationGroup', () => {
  const group: FieldManifest<FieldMetadataType.MORPH_RELATION> = {
    type: FieldMetadataType.MORPH_RELATION,
    universalIdentifier: 'group',
    morphId: 'group',
    name: 'relatedTo',
    label: 'Related to',
    objectUniversalIdentifier: 'source',
    relationTargetFieldMetadataUniversalIdentifier: null,
    relationTargetObjectMetadataUniversalIdentifier: null,
    universalSettings: { relationType: RelationType.MANY_TO_ONE },
  };

  it('narrows groups to null target identifiers', () => {
    expect(getTargetIdentifiers(group)).toBeNull();
  });

  it('narrows physical targets to required target identifiers', () => {
    expect(
      getTargetIdentifiers({
        ...group,
        universalIdentifier: 'target',
        relationTargetFieldMetadataUniversalIdentifier: 'inverse',
        relationTargetObjectMetadataUniversalIdentifier: 'destination',
      }),
    ).toEqual(['inverse', 'destination']);
  });
});
