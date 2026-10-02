import { FieldMetadataType, MetadataReadability } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { buildColumnResultAlias } from 'src/engine/twenty-orm/sql/utils/build-column-result-alias.util';
import { type CompiledStatement } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

const SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';
const OBJECT_METADATA_ID = 'company-object-id';
const RECORD_SHARE_OBJECT_METADATA_ID = 'record-share-object-id';
const DESTROYED_RECORD_IDS = [
  '20202020-0000-4000-8000-000000000001',
  '20202020-0000-4000-8000-000000000002',
];

const buildTableShape = (
  objectMetadataId: string,
  tableName: string,
): WorkspaceTableShape => ({
  objectMetadataId,
  nameSingular: tableName,
  schemaName: SCHEMA_NAME,
  tableName,
  columnShapeByColumnName: Object.fromEntries(
    ['id', 'deletedAt'].map((columnName) => [
      columnName,
      {
        columnName,
        fieldMetadataId: `field-${columnName}`,
        fieldName: columnName,
        fieldMetadataType: FieldMetadataType.TEXT,
      },
    ]),
  ),
  columnNames: ['id', 'deletedAt'],
  relationShapeByFieldName: {},
  hasDeletedAtColumn: true,
});

const companyTableShape = buildTableShape(OBJECT_METADATA_ID, 'company');
const recordShareTableShape = buildTableShape(
  RECORD_SHARE_OBJECT_METADATA_ID,
  'recordShare',
);

const idFlatFieldMetadata = getFlatFieldMetadataMock({
  universalIdentifier: 'company-id-field-universal-identifier',
  objectMetadataId: OBJECT_METADATA_ID,
  type: FieldMetadataType.UUID,
  name: 'id',
});

const isRecordShareStatement = (statement: CompiledStatement) =>
  statement.text.includes('"recordShare"');

const buildRepository = ({
  readability,
  isSystem = false,
  isTransactional = true,
  objectIdByNameSingular = { recordShare: RECORD_SHARE_OBJECT_METADATA_ID },
}: {
  readability: MetadataReadability;
  isSystem?: boolean;
  isTransactional?: boolean;
  objectIdByNameSingular?: Record<string, string>;
}) => {
  const executedStatements: CompiledStatement[] = [];
  const flatObjectMetadata: FlatObjectMetadata = getFlatObjectMetadataMock({
    universalIdentifier: 'company-universal-identifier',
    id: OBJECT_METADATA_ID,
    nameSingular: 'company',
    readability,
    isSystem,
    fieldIds: [idFlatFieldMetadata.id],
  });
  const internalContext = {
    workspaceId: 'workspace-id',
    flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
    flatFieldMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: idFlatFieldMetadata,
      flatEntityMaps: createEmptyFlatEntityMaps(),
    }),
    objectIdByNameSingular,
    featureFlagsMap: {},
    recordStock: { releaseRecordStock: jest.fn() },
  } as unknown as WorkspaceInternalContext;
  const runInNewTransaction = jest.fn();

  const createRepository = (
    repositoryIsTransactional: boolean,
  ): WorkspaceRepository =>
    new WorkspaceRepository({
      tableShape: companyTableShape,
      flatObjectMetadata,
      internalContext,
      authContext: { type: 'system' } as WorkspaceAuthContext,
      executor: {
        execute: async (statement) => {
          executedStatements.push(statement);

          return isRecordShareStatement(statement)
            ? []
            : DESTROYED_RECORD_IDS.map((id) => ({
                [buildColumnResultAlias('company', 'id')]: id,
              }));
        },
      },
      objectRecordsPermissions: {},
      shouldBypassPermissionChecks: true,
      shouldSkipEventEmission: true,
      tableShapeByObjectMetadataId: (objectMetadataId) =>
        objectMetadataId === RECORD_SHARE_OBJECT_METADATA_ID
          ? recordShareTableShape
          : companyTableShape,
      flatObjectMetadataByObjectMetadataId: () => flatObjectMetadata,
      getRepositoryForObjectMetadataId: jest.fn(),
      isTransactional: repositoryIsTransactional,
      runInNewTransaction,
    });

  const transactionalRepository = createRepository(true);

  runInNewTransaction.mockImplementation((work) =>
    work(transactionalRepository),
  );

  return {
    repository: createRepository(isTransactional),
    executedStatements,
    runInNewTransaction,
  };
};

describe('WorkspaceRepository destroy', () => {
  it('should delete the record shares of destroyed records in one statement', async () => {
    const { repository, executedStatements } = buildRepository({
      readability: MetadataReadability.PRIVATE,
    });

    await repository.delete(DESTROYED_RECORD_IDS);

    const recordShareStatements = executedStatements.filter(
      isRecordShareStatement,
    );

    expect(recordShareStatements).toEqual([
      {
        text: `DELETE FROM "${SCHEMA_NAME}"."recordShare" WHERE "objectMetadataId" = $1 AND "recordId" = ANY($2)`,
        values: [OBJECT_METADATA_ID, DESTROYED_RECORD_IDS],
      },
    ]);
  });

  it('should delete the record shares of an object open by default', async () => {
    const { repository, executedStatements } = buildRepository({
      readability: MetadataReadability.OPEN,
    });

    await repository.delete(DESTROYED_RECORD_IDS);

    expect(executedStatements.filter(isRecordShareStatement)).toHaveLength(1);
  });

  it('should destroy records and their shares in one transaction', async () => {
    const { repository, runInNewTransaction } = buildRepository({
      readability: MetadataReadability.PRIVATE,
      isTransactional: false,
    });

    await repository.delete(DESTROYED_RECORD_IDS);

    expect(runInNewTransaction).toHaveBeenCalledTimes(1);
  });

  it('should leave record shares alone on soft delete', async () => {
    const { repository, executedStatements } = buildRepository({
      readability: MetadataReadability.PRIVATE,
    });

    await repository.softDelete(DESTROYED_RECORD_IDS);

    expect(executedStatements.filter(isRecordShareStatement)).toEqual([]);
  });

  it.each([
    { readability: MetadataReadability.SYSTEM, isSystem: true },
    { readability: MetadataReadability.OPEN, isSystem: true },
  ])(
    'should skip objects that cannot hold record shares ($readability, system: $isSystem)',
    async ({ readability, isSystem }) => {
      const { repository, executedStatements, runInNewTransaction } =
        buildRepository({ readability, isSystem, isTransactional: false });

      await repository.delete(DESTROYED_RECORD_IDS);

      expect(executedStatements.filter(isRecordShareStatement)).toEqual([]);
      expect(runInNewTransaction).not.toHaveBeenCalled();
    },
  );

  it('should skip workspaces without the record share object', async () => {
    const { repository, executedStatements } = buildRepository({
      readability: MetadataReadability.PRIVATE,
      objectIdByNameSingular: {},
    });

    await repository.delete(DESTROYED_RECORD_IDS);

    expect(executedStatements.filter(isRecordShareStatement)).toEqual([]);
  });
});
