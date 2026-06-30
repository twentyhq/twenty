import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

// Asserts the DB-level invariant the backfill relies on: a custom object's
// searchFieldMetadata rows are persisted with the object's own applicationId, never the
// standard application's. The backfill's selection/grouping/idempotency is unit-tested
// in build-search-field-metadata-backfill-operations.util.spec.ts.
const LABEL_FIELD_NAME = 'tag';
const PREFIX_OVERLAP_FIELD_NAME = 'tagline';

const STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-64aa-4b6f-b003-9c74b97cee20';

type SearchFieldMetadataRow = {
  objectApplicationId: string;
  searchFieldApplicationId: string;
  fieldObjectMetadataId: string;
  fieldName: string;
};

const querySearchFieldMetadataRows = async (
  objectMetadataId: string,
): Promise<SearchFieldMetadataRow[]> => {
  return global.testDataSource.query(
    `SELECT
       om."applicationId" AS "objectApplicationId",
       sfm."applicationId" AS "searchFieldApplicationId",
       fm."objectMetadataId" AS "fieldObjectMetadataId",
       fm.name AS "fieldName"
     FROM core."searchFieldMetadata" sfm
     INNER JOIN core."objectMetadata" om ON om.id = sfm."objectMetadataId"
     INNER JOIN core."fieldMetadata" fm ON fm.id = sfm."fieldMetadataId"
     WHERE sfm."objectMetadataId" = $1
     ORDER BY fm.name ASC`,
    [objectMetadataId],
  );
};

// Resolves the standard application id of the workspace that owns the given object,
// without needing the object's (GraphQL-hidden) workspaceId.
const queryStandardApplicationIdForObjectWorkspace = async (
  objectMetadataId: string,
): Promise<string> => {
  const rows: { id: string }[] = await global.testDataSource.query(
    `SELECT app.id AS id
     FROM core."application" app
     INNER JOIN core."objectMetadata" om ON om."workspaceId" = app."workspaceId"
     WHERE om.id = $1 AND app."universalIdentifier" = $2`,
    [objectMetadataId, STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER],
  );

  return rows[0].id;
};

describe('searchFieldMetadata rows - app-correct and deterministic per object', () => {
  let testObjectMetadataId: string;
  let labelFieldMetadataId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'backfillSearchFieldObject',
        namePlural: 'backfillSearchFieldObjects',
        labelSingular: 'Backfill Search Field Object',
        labelPlural: 'Backfill Search Field Objects',
        icon: 'IconSearch',
        isLabelSyncedWithName: false,
      },
    });

    testObjectMetadataId = objectMetadataId;

    const {
      data: {
        createOneField: { id: labelFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: LABEL_FIELD_NAME,
        label: 'Tag',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `id name`,
    });

    labelFieldMetadataId = labelFieldId;

    await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: PREFIX_OVERLAP_FIELD_NAME,
        label: 'Tagline',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `id name`,
    });

    await updateOneObjectMetadata({
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: {
          labelIdentifierFieldMetadataId: labelFieldMetadataId,
        },
      },
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testObjectMetadataId },
    });
  });

  it('persists every searchFieldMetadata row of a custom object with the custom object application id, not the standard application id', async () => {
    const rows = await querySearchFieldMetadataRows(testObjectMetadataId);
    const standardApplicationId =
      await queryStandardApplicationIdForObjectWorkspace(testObjectMetadataId);

    expect(rows.length).toBeGreaterThan(0);

    for (const row of rows) {
      // A custom object's rows carry its own applicationId, never the standard one.
      expect(row.searchFieldApplicationId).toBe(row.objectApplicationId);
      expect(row.searchFieldApplicationId).not.toBe(standardApplicationId);
      // No cross-object leakage: every targeted field belongs to this object.
      expect(row.fieldObjectMetadataId).toBe(testObjectMetadataId);
    }

    expect(rows.some((row) => row.fieldName === LABEL_FIELD_NAME)).toBe(true);
  });
});
