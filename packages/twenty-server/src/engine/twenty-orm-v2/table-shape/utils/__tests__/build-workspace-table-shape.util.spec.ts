import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildWorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/utils/build-workspace-table-shape.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const buildFlatFieldMetadata = (
  flatFieldMetadata: Partial<FlatFieldMetadata> & {
    id: string;
    name: string;
    type: FieldMetadataType;
  },
): FlatFieldMetadata => flatFieldMetadata as unknown as FlatFieldMetadata;

const buildFlatFieldMetadataMaps = (
  flatFieldMetadatas: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> =>
  ({
    universalIdentifierById: Object.fromEntries(
      flatFieldMetadatas.map((flatFieldMetadata) => [
        flatFieldMetadata.id,
        flatFieldMetadata.id,
      ]),
    ),
    byUniversalIdentifier: Object.fromEntries(
      flatFieldMetadatas.map((flatFieldMetadata) => [
        flatFieldMetadata.id,
        flatFieldMetadata,
      ]),
    ),
  }) as unknown as FlatEntityMaps<FlatFieldMetadata>;

describe('buildWorkspaceTableShape', () => {
  const flatFieldMetadatas = [
    buildFlatFieldMetadata({
      id: 'field-id',
      universalIdentifier: 'field-id',
      name: 'id',
      type: FieldMetadataType.UUID,
    }),
    buildFlatFieldMetadata({
      id: 'field-name',
      name: 'name',
      type: FieldMetadataType.FULL_NAME,
    }),
    buildFlatFieldMetadata({
      id: 'field-deletedAt',
      name: 'deletedAt',
      type: FieldMetadataType.DATE_TIME,
    }),
    buildFlatFieldMetadata({
      id: 'field-company',
      name: 'company',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.MANY_TO_ONE },
      relationTargetObjectMetadataId: 'company-object-id',
      relationTargetFieldMetadataId: 'field-people',
    }),
    buildFlatFieldMetadata({
      id: 'field-pets',
      name: 'pets',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.ONE_TO_MANY },
      relationTargetObjectMetadataId: 'pet-object-id',
      relationTargetFieldMetadataId: 'field-owner',
    }),
  ];

  const flatObjectMetadata = {
    id: 'person-object-id',
    nameSingular: 'person',
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    fieldIds: flatFieldMetadatas.map(
      (flatFieldMetadata) => flatFieldMetadata.id,
    ),
  } as unknown as FlatObjectMetadata;

  const tableShape = buildWorkspaceTableShape({
    workspaceId: WORKSPACE_ID,
    flatObjectMetadata,
    flatFieldMetadataMaps: buildFlatFieldMetadataMaps(flatFieldMetadatas),
  });

  it('should qualify the table with the workspace schema', () => {
    expect(tableShape.schemaName).toMatch(/^workspace_/);
    expect(tableShape.tableName).toBe('person');
  });

  it('should prefix custom object tables with an underscore', () => {
    const customTableShape = buildWorkspaceTableShape({
      workspaceId: WORKSPACE_ID,
      flatObjectMetadata: {
        ...flatObjectMetadata,
        applicationUniversalIdentifier: 'a-custom-application',
        nameSingular: 'rocket',
      } as unknown as FlatObjectMetadata,
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps(flatFieldMetadatas),
    });

    expect(customTableShape.tableName).toBe('_rocket');
  });

  it('should expand a composite field into one column per property', () => {
    expect(tableShape.columnNames).toEqual(
      expect.arrayContaining(['nameFirstName', 'nameLastName']),
    );
    expect(tableShape.columnNames).not.toContain('name');
  });

  it('should record the parent field of every composite sub-column', () => {
    expect(
      tableShape.columnShapeByColumnName['nameFirstName']
        .compositeParentFieldName,
    ).toBe('name');
  });

  it('should give a to-one relation a foreign key column but a to-many none', () => {
    expect(tableShape.columnNames).toContain('companyId');
    expect(tableShape.columnNames).not.toContain('petsId');

    expect(tableShape.relationShapeByFieldName['company'].joinColumnName).toBe(
      'companyId',
    );
    expect(
      tableShape.relationShapeByFieldName['pets'].joinColumnName,
    ).toBeUndefined();
  });

  it('should detect the soft-delete column', () => {
    expect(tableShape.hasDeletedAtColumn).toBe(true);
  });
});
