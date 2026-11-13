import gql from 'graphql-tag';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { waitForDeferredWorkspaceOperationsOrThrow } from 'test/integration/utils/wait-for-deferred-workspace-operations-or-throw.util';
import {
  FieldMetadataType,
  IndexType,
  OrderByDirection,
} from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const OBJECT_NAME_SINGULAR = 'directionLog';
const TABLE_NAME = `_${OBJECT_NAME_SINGULAR}`;
const SCHEMA_NAME = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

type CreatedIndex = {
  id: string;
  name: string;
  indexFieldMetadataList: {
    fieldMetadataId: string;
    direction: string | null;
  }[];
};

const createOneIndex = async ({
  objectMetadataId,
  fieldMetadataId,
  direction,
  indexType = IndexType.BTREE,
}: {
  objectMetadataId: string;
  fieldMetadataId: string;
  direction?: OrderByDirection;
  indexType?: IndexType;
}) => {
  await waitForDeferredWorkspaceOperationsOrThrow();

  const response = await makeMetadataApiRequest({
    query: gql`
      mutation CreateOneIndex($input: CreateOneIndexInput!) {
        createOneIndex(input: $input) {
          id
          name
          indexFieldMetadataList {
            fieldMetadataId
            direction
          }
        }
      }
    `,
    variables: {
      input: {
        index: {
          objectMetadataId,
          indexType,
          fields: [{ fieldMetadataId, direction }],
        },
      },
    },
  });

  return {
    createdIndex: response.body.data?.createOneIndex as
      | CreatedIndex
      | undefined,
    errors: response.body.errors,
  };
};

const findIndexDefinition = async (indexName: string): Promise<string> => {
  const [{ indexdef }] = await global.testDataSource.query(
    'SELECT indexdef FROM pg_indexes WHERE schemaname = $1 AND indexname = $2',
    [SCHEMA_NAME, indexName],
  );

  return indexdef;
};

const explainWithoutSequentialScan = async (sql: string): Promise<string> => {
  const queryRunner = global.testDataSource.createQueryRunner();

  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();
    await queryRunner.query('SET LOCAL enable_seqscan = off');

    const planRows: { 'QUERY PLAN': string }[] = await queryRunner.query(
      `EXPLAIN (COSTS OFF) ${sql}`,
    );

    return planRows.map((planRow) => planRow['QUERY PLAN']).join('\n');
  } finally {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  }
};

describe('Custom index direction', () => {
  let objectMetadataId: string;
  let occurredOnFieldMetadataId: string;
  let tagsFieldMetadataId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: OBJECT_NAME_SINGULAR,
        namePlural: `${OBJECT_NAME_SINGULAR}s`,
        labelSingular: 'Direction log',
        labelPlural: 'Direction logs',
        icon: 'IconList',
        isLabelSyncedWithName: false,
      },
    });

    objectMetadataId = id;

    const {
      data: { createOneField },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId,
        name: 'occurredOn',
        label: 'Occurred On',
        type: FieldMetadataType.DATE,
        isLabelSyncedWithName: false,
      },
    });

    occurredOnFieldMetadataId = createOneField.id;

    const {
      data: { createOneField: tagsField },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId,
        name: 'tags',
        label: 'Tags',
        type: FieldMetadataType.ARRAY,
        isLabelSyncedWithName: false,
      },
    });

    tagsFieldMetadataId = tagsField.id;
  });

  afterAll(async () => {
    await expectEventually(async () => {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: { isActive: false },
        },
      });
    });
    await expectEventually(async () => {
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: objectMetadataId },
      });
    });
  });

  it('builds a descending nulls last index that serves the newest first order', async () => {
    const { createdIndex, errors } = await createOneIndex({
      objectMetadataId,
      fieldMetadataId: occurredOnFieldMetadataId,
      direction: OrderByDirection.DescNullsLast,
    });

    expect(errors).toBeUndefined();
    expect(createdIndex?.indexFieldMetadataList).toEqual([
      {
        fieldMetadataId: occurredOnFieldMetadataId,
        direction: OrderByDirection.DescNullsLast,
      },
    ]);

    const indexName = createdIndex?.name ?? '';

    expect(await findIndexDefinition(indexName)).toContain(
      '("occurredOn" DESC NULLS LAST)',
    );

    const plan = await explainWithoutSequentialScan(
      `SELECT id FROM "${SCHEMA_NAME}"."${TABLE_NAME}" ORDER BY "occurredOn" DESC NULLS LAST LIMIT 61`,
    );

    expect(plan).toContain(`Index Scan using "${indexName}"`);
    expect(plan).not.toContain('Sort Key');
  });

  it('keeps an ascending index on the same field under its own name', async () => {
    const { createdIndex, errors } = await createOneIndex({
      objectMetadataId,
      fieldMetadataId: occurredOnFieldMetadataId,
    });

    expect(errors).toBeUndefined();
    expect(createdIndex?.indexFieldMetadataList[0].direction).toBeNull();
    expect(await findIndexDefinition(createdIndex?.name ?? '')).toContain(
      '("occurredOn")',
    );
  });

  it.each([OrderByDirection.DescNullsLast, OrderByDirection.AscNullsLast])(
    'refuses the %s direction on an index type that cannot sort',
    async (direction) => {
      const { createdIndex, errors } = await createOneIndex({
        objectMetadataId,
        fieldMetadataId: tagsFieldMetadataId,
        direction,
        indexType: IndexType.GIN,
      });

      expect(createdIndex).toBeUndefined();
      expect(errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
      expect(errors?.[0]?.message).toContain(
        'does not support a sort direction',
      );
    },
  );
});
