import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { type FieldManifest, type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  ViewSortDirection,
  ViewType,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const APP_ID = uuidv4();
const APP_ROLE_ID = uuidv4();
const PERSON_VIEW_ID = uuidv4();
const VIEW_SORT_ID = uuidv4();
const OLD_TARGET_FIELD_ID = uuidv4();
const NEW_TARGET_FIELD_ID = uuidv4();

const buildCompanyNumberField = ({
  universalIdentifier,
  name,
}: {
  universalIdentifier: string;
  name: string;
}): FieldManifest => ({
  universalIdentifier,
  type: FieldMetadataType.NUMBER,
  name,
  label: name,
  icon: 'IconNumber',
  objectUniversalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
});

const buildManifest = ({
  targetField,
}: {
  targetField: FieldManifest;
}): Manifest =>
  buildBaseManifest({
    appId: APP_ID,
    roleId: APP_ROLE_ID,
    overrides: {
      fields: [targetField],
      views: [
        {
          universalIdentifier: PERSON_VIEW_ID,
          name: 'People by company score',
          objectUniversalIdentifier:
            STANDARD_OBJECTS.person.universalIdentifier,
          type: ViewType.TABLE,
          icon: 'IconTable',
          sorts: [
            {
              universalIdentifier: VIEW_SORT_ID,
              fieldMetadataUniversalIdentifier:
                STANDARD_OBJECTS.person.fields.company.universalIdentifier,
              direction: ViewSortDirection.DESC,
              relationTargetFieldMetadataUniversalIdentifier:
                targetField.universalIdentifier,
            },
          ],
        },
      ],
    },
  });

type ViewWithSorts = {
  universalIdentifier: string;
  viewSorts: {
    id: string;
    fieldMetadataId: string;
    relationTargetFieldMetadataId: string | null;
  }[];
};

const findFieldIdByUniversalIdentifier = async (
  universalIdentifier: string,
) => {
  const { fields } = await findManyFieldsMetadata({
    expectToFail: false,
    input: { filter: {}, paging: { first: 1000 } },
    gqlFields: 'id universalIdentifier',
  });

  return fields.find(
    ({ node }: { node: { universalIdentifier: string } }) =>
      node.universalIdentifier === universalIdentifier,
  )?.node.id;
};

const findViewSort = async () => {
  const { data } = await findViews<ViewWithSorts>({
    expectToFail: false,
    gqlFields: `
      universalIdentifier
      viewSorts {
        id
        fieldMetadataId
        relationTargetFieldMetadataId
      }
    `,
  });

  const companyFieldId = await findFieldIdByUniversalIdentifier(
    STANDARD_OBJECTS.person.fields.company.universalIdentifier,
  );

  return data.getViews
    .find((view) => view.universalIdentifier === PERSON_VIEW_ID)
    ?.viewSorts.find((viewSort) => viewSort.fieldMetadataId === companyFieldId);
};

describe('Sync application with a view sort ordering by a field of the related record', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_ID,
      name: 'View sort relation target app',
      description: 'App shipping a sort on a field of the related record',
      sourcePath: 'test-view-sort-relation-target-app',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_ID,
    });
  });

  it('keeps the sort when an update deletes its target field and repoints it to a new one', async () => {
    const { errors: firstSyncErrors } = await syncApplication({
      manifest: buildManifest({
        targetField: buildCompanyNumberField({
          universalIdentifier: OLD_TARGET_FIELD_ID,
          name: 'integrationOldScore',
        }),
      }),
      expectToFail: false,
    });

    expect(firstSyncErrors).toBeUndefined();

    const viewSortBeforeRepoint = await findViewSort();

    expect(viewSortBeforeRepoint?.relationTargetFieldMetadataId).toBe(
      await findFieldIdByUniversalIdentifier(OLD_TARGET_FIELD_ID),
    );

    const { errors: secondSyncErrors } = await syncApplication({
      manifest: buildManifest({
        targetField: buildCompanyNumberField({
          universalIdentifier: NEW_TARGET_FIELD_ID,
          name: 'integrationNewScore',
        }),
      }),
      expectToFail: false,
    });

    expect(secondSyncErrors).toBeUndefined();
    expect(
      await findFieldIdByUniversalIdentifier(OLD_TARGET_FIELD_ID),
    ).toBeUndefined();

    const viewSortAfterRepoint = await findViewSort();

    expect(viewSortAfterRepoint?.id).toBe(viewSortBeforeRepoint?.id);
    expect(viewSortAfterRepoint?.relationTargetFieldMetadataId).toBe(
      await findFieldIdByUniversalIdentifier(NEW_TARGET_FIELD_ID),
    );
  }, 60000);
});
