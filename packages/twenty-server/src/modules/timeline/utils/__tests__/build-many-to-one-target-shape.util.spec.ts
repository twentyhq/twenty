import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildFlatEntityMapsFixture } from 'src/modules/timeline/utils/__tests__/build-flat-entity-maps.fixture';
import { buildRelationTargetShape } from 'src/modules/timeline/utils/build-relation-target-shape.util';

const COMPANY_OBJECT = {
  id: 'company-object',
  universalIdentifier: 'company-object-uid',
  nameSingular: 'company',
};

const flatObjectMetadataMaps = buildFlatEntityMapsFixture<FlatObjectMetadata>([
  COMPANY_OBJECT,
]);

const flatFieldMetadataMaps = buildFlatEntityMapsFixture<FlatFieldMetadata>([]);

const PERSON_COMPANY_FIELD = {
  id: 'person-company-field',
  universalIdentifier: 'person-company-field-uid',
  name: 'company',
  type: FieldMetadataType.RELATION,
  relationTargetObjectMetadataId: COMPANY_OBJECT.id,
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'companyId',
  },
} as unknown as FlatFieldMetadata;

describe('buildRelationTargetShape on a many-to-one lookup', () => {
  it('should build the shape from the join column and target object', () => {
    const shape = buildRelationTargetShape({
      relationFlatFieldMetadata: PERSON_COMPANY_FIELD,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(shape).toEqual({
      kind: 'MANY_TO_ONE',
      relationFieldName: 'company',
      targetJoinColumn: {
        joinColumnName: 'companyId',
        targetObjectNameSingular: 'company',
      },
    });
  });

  it('should derive the join column from the field name when settings carry none', () => {
    const shape = buildRelationTargetShape({
      relationFlatFieldMetadata: {
        ...PERSON_COMPANY_FIELD,
        settings: { relationType: RelationType.MANY_TO_ONE },
      } as unknown as FlatFieldMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(shape?.kind).toBe('MANY_TO_ONE');
    expect(
      shape?.kind === 'MANY_TO_ONE' && shape.targetJoinColumn.joinColumnName,
    ).toBe('companyId');
  });

  it('should return undefined for a one-to-many relation', () => {
    const shape = buildRelationTargetShape({
      relationFlatFieldMetadata: {
        ...PERSON_COMPANY_FIELD,
        settings: { relationType: RelationType.ONE_TO_MANY },
      } as unknown as FlatFieldMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(shape).toBeUndefined();
  });

  it('should return undefined for a morph many-to-one lookup', () => {
    const shape = buildRelationTargetShape({
      relationFlatFieldMetadata: {
        ...PERSON_COMPANY_FIELD,
        type: FieldMetadataType.MORPH_RELATION,
      } as unknown as FlatFieldMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(shape).toBeUndefined();
  });

  it('should return undefined when the target object is unknown', () => {
    const shape = buildRelationTargetShape({
      relationFlatFieldMetadata: {
        ...PERSON_COMPANY_FIELD,
        relationTargetObjectMetadataId: 'missing-object',
      } as unknown as FlatFieldMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(shape).toBeUndefined();
  });
});
