import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  type FieldMetadataComplexOption,
  FieldMetadataType,
} from 'twenty-shared/types';

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type StoredOption = FieldMetadataComplexOption & { id: string };

type OptionRow = {
  universalIdentifier: string;
  applicationId: string;
  value: string;
  label: string;
  color: string | null;
  position: number;
  isActive: boolean;
  overrides: object | null;
};

const findOptionRows = async (fieldMetadataId: string): Promise<OptionRow[]> =>
  globalThis.testDataSource.query(
    `SELECT "universalIdentifier", "applicationId", value, label, color, position, "isActive", overrides
      FROM core."fieldMetadataOption" WHERE "fieldMetadataId" = $1 ORDER BY position`,
    [fieldMetadataId],
  );

const findFieldApplicationId = async (
  fieldMetadataId: string,
): Promise<string> => {
  const [{ applicationId }] = await globalThis.testDataSource.query(
    `SELECT "applicationId" FROM core."fieldMetadata" WHERE id = $1`,
    [fieldMetadataId],
  );

  return applicationId;
};

const toExpectedRows = ({
  options,
  applicationId,
}: {
  options: StoredOption[];
  applicationId: string;
}) =>
  [...options]
    .sort((first, second) => first.position - second.position)
    .map(({ id, value, label, color, position }) => ({
      universalIdentifier: id,
      applicationId,
      value,
      label,
      color,
      position,
      isActive: true,
      overrides: null,
    }));

describe('field metadata option rows follow field options', () => {
  let objectMetadataId: string;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'optionRowsSync',
        namePlural: 'optionRowsSyncs',
        labelSingular: 'Option Rows Sync',
        labelPlural: 'Option Rows Syncs',
        icon: 'IconTestPipe',
        isLabelSyncedWithName: false,
      },
    });

    objectMetadataId = data.createOneObject.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
  });

  it('creates, updates and deletes option rows with the field', async () => {
    const { data: createData } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'stageField',
        label: 'Stage Field',
        isLabelSyncedWithName: false,
        options: [
          { label: 'New', value: 'NEW', color: 'green', position: 0 },
          { label: 'Won', value: 'WON', color: 'blue', position: 1 },
          { label: 'Lost', value: 'LOST', color: 'red', position: 2 },
        ],
      },
      gqlFields: 'id options',
    });

    const fieldMetadataId: string = createData.createOneField.id;
    const createdOptions = createData.createOneField.options as StoredOption[];
    const applicationId = await findFieldApplicationId(fieldMetadataId);

    expect(await findOptionRows(fieldMetadataId)).toEqual(
      toExpectedRows({ options: createdOptions, applicationId }),
    );

    const [newOption, wonOption] = createdOptions;

    const { data: updateData } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: {
          options: [
            { ...wonOption, label: 'Closed won', position: 0 },
            { ...newOption, position: 1 },
            { label: 'Paused', value: 'PAUSED', color: 'gray', position: 2 },
          ] satisfies FieldMetadataComplexOption[],
        },
      },
      gqlFields: 'id options',
    });

    const updatedOptions = updateData.updateOneField.options as StoredOption[];

    expect(await findOptionRows(fieldMetadataId)).toEqual(
      toExpectedRows({ options: updatedOptions, applicationId }),
    );

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: fieldMetadataId },
    });

    expect(await findOptionRows(fieldMetadataId)).toEqual([]);
  });

  it('swaps and shifts option values in one update', async () => {
    const { data: createData } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'levelField',
        label: 'Level Field',
        isLabelSyncedWithName: false,
        options: [
          { label: 'Low', value: 'LOW', color: 'green', position: 0 },
          { label: 'High', value: 'HIGH', color: 'red', position: 1 },
        ],
      },
      gqlFields: 'id options',
    });

    const fieldMetadataId: string = createData.createOneField.id;
    const [lowOption, highOption] = createData.createOneField
      .options as StoredOption[];
    const applicationId = await findFieldApplicationId(fieldMetadataId);

    const { data: swapData } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: {
          options: [
            { ...lowOption, value: 'HIGH' },
            { ...highOption, value: 'LOW' },
          ] satisfies FieldMetadataComplexOption[],
        },
      },
      gqlFields: 'id options',
    });

    expect(await findOptionRows(fieldMetadataId)).toEqual(
      toExpectedRows({
        options: swapData.updateOneField.options as StoredOption[],
        applicationId,
      }),
    );

    const { data: shiftData } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: {
          options: [
            { ...lowOption, value: 'LOW' },
            { ...highOption, value: 'MEDIUM' },
          ] satisfies FieldMetadataComplexOption[],
        },
      },
      gqlFields: 'id options',
    });

    expect(await findOptionRows(fieldMetadataId)).toEqual(
      toExpectedRows({
        options: shiftData.updateOneField.options as StoredOption[],
        applicationId,
      }),
    );
  });

  it('reads the options of a field from its rows', async () => {
    const { data } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'readFromRowsField',
        label: 'Read From Rows Field',
        isLabelSyncedWithName: false,
        options: [
          { label: 'Open', value: 'OPEN', color: 'green', position: 0 },
          { label: 'Closed', value: 'CLOSED', color: 'red', position: 1 },
        ],
      },
      gqlFields: 'id options',
    });
    const fieldMetadataId: string = data.createOneField.id;
    const [openOption, closedOption] = data.createOneField
      .options as StoredOption[];

    await globalThis.testDataSource.query(
      `UPDATE core."fieldMetadataOption" SET label = 'Open in rows'
        WHERE "fieldMetadataId" = $1 AND value = 'OPEN'`,
      [fieldMetadataId],
    );
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatFieldMetadataMaps',
      'flatFieldMetadataOptionMaps',
    ]);

    try {
      const { data: updateData } = await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: fieldMetadataId,
          updatePayload: { label: 'Read From Rows Field Renamed' },
        },
        gqlFields: 'id options',
      });

      expect(updateData.updateOneField.options).toEqual([
        { ...openOption, label: 'Open in rows' },
        closedOption,
      ]);
    } finally {
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: fieldMetadataId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete: fieldMetadataId },
      });
    }
  });

  it('validates a record value against the rows, not the stored options', async () => {
    const { data } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'recordReadsRowsField',
        label: 'Record Reads Rows Field',
        isLabelSyncedWithName: false,
        options: [
          { label: 'Open', value: 'OPEN', color: 'green', position: 0 },
          { label: 'Closed', value: 'CLOSED', color: 'red', position: 1 },
        ],
      },
      gqlFields: 'id options',
    });
    const fieldMetadataId: string = data.createOneField.id;
    const [openOption] = data.createOneField.options as StoredOption[];

    await globalThis.testDataSource.query(
      `UPDATE core."fieldMetadata" SET options = $2::jsonb WHERE id = $1`,
      [fieldMetadataId, JSON.stringify([openOption])],
    );
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatFieldMetadataMaps',
      'flatFieldMetadataMapsOrm',
      'flatFieldMetadataOptionMaps',
    ]);

    try {
      const { data: recordData, errors } = await createOneOperation({
        objectMetadataSingularName: 'optionRowsSync',
        input: { recordReadsRowsField: 'CLOSED' },
        gqlFields: 'id recordReadsRowsField',
      });

      expect(errors).toBeUndefined();
      expect(recordData.createOneResponse.recordReadsRowsField).toBe('CLOSED');
    } finally {
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: fieldMetadataId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete: fieldMetadataId },
      });
    }
  });

  it('rejects an option id already used by another field', async () => {
    const { data: createData } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'sourceField',
        label: 'Source Field',
        isLabelSyncedWithName: false,
        options: [{ label: 'Web', value: 'WEB', color: 'blue', position: 0 }],
      },
      gqlFields: 'id options',
    });

    const sourceFieldId: string = createData.createOneField.id;
    const sourceOptions = createData.createOneField.options as StoredOption[];

    try {
      const { errors } = await createOneFieldMetadata({
        expectToFail: true,
        input: {
          objectMetadataId,
          type: FieldMetadataType.SELECT,
          name: 'copiedSourceField',
          label: 'Copied Source Field',
          isLabelSyncedWithName: false,
          options: sourceOptions,
        },
        gqlFields: 'id',
      });

      expect(JSON.stringify(errors)).toContain('ENTITY_ALREADY_EXISTS');
      expect(await findOptionRows(sourceFieldId)).toEqual(
        toExpectedRows({
          options: sourceOptions,
          applicationId: await findFieldApplicationId(sourceFieldId),
        }),
      );
    } finally {
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: sourceFieldId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete: sourceFieldId },
      });
    }
  });

  it('adds a caller-owned row on a standard field and leaves its standard rows alone', async () => {
    const [stageField] = await globalThis.testDataSource.query(
      `SELECT field.id, field.options, field."applicationId"
        FROM core."fieldMetadata" field
        JOIN core."objectMetadata" object ON object.id = field."objectMetadataId"
        WHERE field."workspaceId" = $1 AND object."nameSingular" = 'opportunity' AND field.name = 'stage'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    const originalOptions = stageField.options as StoredOption[];

    try {
      const { data: updateData } = await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: stageField.id,
          updatePayload: {
            options: [
              ...originalOptions,
              {
                label: 'On hold',
                value: 'ON_HOLD',
                color: 'gray',
                position: originalOptions.length,
              },
            ] satisfies FieldMetadataComplexOption[],
          },
        },
        gqlFields: 'id options',
      });

      const updatedOptions = updateData.updateOneField
        .options as StoredOption[];
      const [{ workspaceCustomApplicationId }] =
        await globalThis.testDataSource.query(
          `SELECT "workspaceCustomApplicationId" FROM core.workspace WHERE id = $1`,
          [SEED_APPLE_WORKSPACE_ID],
        );

      expect(await findOptionRows(stageField.id)).toEqual(
        toExpectedRows({
          options: updatedOptions,
          applicationId: stageField.applicationId,
        }).map((row) =>
          row.value === 'ON_HOLD'
            ? { ...row, applicationId: workspaceCustomApplicationId }
            : row,
        ),
      );
    } finally {
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: stageField.id,
          updatePayload: { options: originalOptions },
        },
      });
    }

    expect(await findOptionRows(stageField.id)).toEqual(
      toExpectedRows({
        options: originalOptions,
        applicationId: stageField.applicationId,
      }),
    );
  });

  it('keeps the options and records of a field with a missing row, and recreates the row on its next edit', async () => {
    const { data } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'missingRowsField',
        label: 'Missing Rows Field',
        isLabelSyncedWithName: false,
        options: [
          { label: 'Open', value: 'OPEN', color: 'green', position: 0 },
          { label: 'Closed', value: 'CLOSED', color: 'red', position: 1 },
        ],
      },
      gqlFields: 'id options',
    });
    const fieldMetadataId: string = data.createOneField.id;
    const options = data.createOneField.options as StoredOption[];

    await globalThis.testDataSource.query(
      `DELETE FROM core."fieldMetadataOption"
        WHERE "fieldMetadataId" = $1 AND value = 'CLOSED'`,
      [fieldMetadataId],
    );
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatFieldMetadataMaps',
      'flatFieldMetadataOptionMaps',
    ]);

    const workspaceSchema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
    const [{ id: recordId }] = await globalThis.testDataSource.query(
      `INSERT INTO "${workspaceSchema}"."_optionRowsSync" ("missingRowsField", "createdByName", "updatedByName")
        VALUES ('CLOSED', 'Test', 'Test') RETURNING id`,
    );

    try {
      const { data: updateData } = await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: fieldMetadataId,
          updatePayload: { label: 'Missing Rows Field Renamed' },
        },
        gqlFields: 'id options',
      });

      expect(updateData.updateOneField.options).toEqual(options);

      const [{ missingRowsField }] = await globalThis.testDataSource.query(
        `SELECT "missingRowsField" FROM "${workspaceSchema}"."_optionRowsSync" WHERE id = $1`,
        [recordId],
      );

      expect(missingRowsField).toBe('CLOSED');

      expect(await findOptionRows(fieldMetadataId)).toEqual(
        toExpectedRows({
          options,
          applicationId: await findFieldApplicationId(fieldMetadataId),
        }),
      );
    } finally {
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: fieldMetadataId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete: fieldMetadataId },
      });
    }
  });

  it('rejects an option id that is not a universal identifier', async () => {
    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: {
        objectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'upperCaseIdField',
        label: 'Upper Case Id Field',
        isLabelSyncedWithName: false,
        options: [
          {
            id: 'D1B2C3D4-0200-4000-A000-0000000000A1',
            label: 'Open',
            value: 'OPEN',
            color: 'green',
            position: 0,
          },
        ],
      },
      gqlFields: 'id',
    });

    expect(JSON.stringify(errors)).toContain('must be lowercase');
  });

  it('keeps a row for every option of the standard fields', async () => {
    const [{ missingOptionRowCount }] = await globalThis.testDataSource.query(
      `SELECT count(*)::int AS "missingOptionRowCount"
        FROM core."fieldMetadata" field
        CROSS JOIN LATERAL jsonb_array_elements(field.options::jsonb) option
        LEFT JOIN core."fieldMetadataOption" row
          ON row."fieldMetadataId" = field.id AND row."universalIdentifier"::text = option->>'id'
        WHERE field."workspaceId" = $1
          AND field.type IN ('SELECT', 'MULTI_SELECT', 'RATING')
          AND (row.id IS NULL OR row.value <> option->>'value')`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    expect(missingOptionRowCount).toBe(0);
  });
});
