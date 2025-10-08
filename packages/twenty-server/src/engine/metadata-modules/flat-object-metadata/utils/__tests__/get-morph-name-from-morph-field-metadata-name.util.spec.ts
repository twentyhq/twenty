import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

describe('getMorphNameFromMorphFieldMetadataName', () => {
  const createMorphRelationFlatFieldMetadataMock = (
    name: string,
    relationType: RelationType,
  ) =>
    ({
      name,
      type: FieldMetadataType.MORPH_RELATION,
      label: name,
      settings: { relationType },
    }) as unknown as FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;

  it('should extract base morph field name for MANY_TO_ONE (removes singular suffix)', () => {
    const morphRelationFlatFieldMetadata =
      createMorphRelationFlatFieldMetadataMock(
        'contactDeal',
        RelationType.MANY_TO_ONE,
      );

    const result = getMorphNameFromMorphFieldMetadataName({
      morphRelationFlatFieldMetadata,
      nameSingular: 'Deal',
      namePlural: 'Deals',
    });

    expect(result).toBe('contact');
  });

  it('should also work extract base morph field name for MANY_TO_ONE if casing is not correct', () => {
    const morphRelationFlatFieldMetadata =
      createMorphRelationFlatFieldMetadataMock(
        'contactDeal',
        RelationType.MANY_TO_ONE,
      );

    const result = getMorphNameFromMorphFieldMetadataName({
      morphRelationFlatFieldMetadata,
      nameSingular: 'deal',
      namePlural: 'deals',
    });

    expect(result).toBe('contact');
  });

  it('should extract base morph field name for ONE_TO_MANY (removes plural suffix)', () => {
    const morphRelationFlatFieldMetadata =
      createMorphRelationFlatFieldMetadataMock(
        'contactDeals',
        RelationType.ONE_TO_MANY,
      );

    const result = getMorphNameFromMorphFieldMetadataName({
      morphRelationFlatFieldMetadata,
      nameSingular: 'Deal',
      namePlural: 'Deals',
    });

    expect(result).toBe('contact');
  });

  it('should return the original name when suffix does not match', () => {
    const morphRelationFlatFieldMetadata =
      createMorphRelationFlatFieldMetadataMock(
        'randomName',
        RelationType.MANY_TO_ONE,
      );

    const result = getMorphNameFromMorphFieldMetadataName({
      morphRelationFlatFieldMetadata,
      nameSingular: 'account',
      namePlural: 'accounts',
    });

    expect(result).toBe('randomName');
  });
});
