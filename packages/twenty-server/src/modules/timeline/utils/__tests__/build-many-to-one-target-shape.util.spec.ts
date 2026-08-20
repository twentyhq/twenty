import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildManyToOneTargetShape } from 'src/modules/timeline/utils/build-many-to-one-target-shape.util';

type FlatEntityFixture = { id: string; universalIdentifier: string };

const buildFlatEntityMaps = <T extends FlatEntityFixture>(
  flatEntities: T[],
): FlatEntityMaps<never> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      flatEntities.map((flatEntity) => [
        flatEntity.universalIdentifier,
        flatEntity,
      ]),
    ),
    universalIdentifierById: Object.fromEntries(
      flatEntities.map((flatEntity) => [
        flatEntity.id,
        flatEntity.universalIdentifier,
      ]),
    ),
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatEntityMaps<never>;

const COMPANY_OBJECT = {
  id: 'company-object',
  universalIdentifier: 'company-object-uid',
  nameSingular: 'company',
};

const flatObjectMetadataMaps = buildFlatEntityMaps([
  COMPANY_OBJECT,
]) as unknown as FlatEntityMaps<FlatObjectMetadata>;

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

describe('buildManyToOneTargetShape', () => {
  it('should build the shape from the join column and target object', () => {
    const shape = buildManyToOneTargetShape({
      relationFlatFieldMetadata: PERSON_COMPANY_FIELD,
      flatObjectMetadataMaps,
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
    const shape = buildManyToOneTargetShape({
      relationFlatFieldMetadata: {
        ...PERSON_COMPANY_FIELD,
        settings: { relationType: RelationType.MANY_TO_ONE },
      } as unknown as FlatFieldMetadata,
      flatObjectMetadataMaps,
    });

    expect(shape?.kind).toBe('MANY_TO_ONE');
    expect(
      shape?.kind === 'MANY_TO_ONE' && shape.targetJoinColumn.joinColumnName,
    ).toBe('companyId');
  });

  it('should return undefined for a one-to-many relation', () => {
    const shape = buildManyToOneTargetShape({
      relationFlatFieldMetadata: {
        ...PERSON_COMPANY_FIELD,
        settings: { relationType: RelationType.ONE_TO_MANY },
      } as unknown as FlatFieldMetadata,
      flatObjectMetadataMaps,
    });

    expect(shape).toBeUndefined();
  });

  it('should return undefined when the target object is unknown', () => {
    const shape = buildManyToOneTargetShape({
      relationFlatFieldMetadata: {
        ...PERSON_COMPANY_FIELD,
        relationTargetObjectMetadataId: 'missing-object',
      } as unknown as FlatFieldMetadata,
      flatObjectMetadataMaps,
    });

    expect(shape).toBeUndefined();
  });
});
