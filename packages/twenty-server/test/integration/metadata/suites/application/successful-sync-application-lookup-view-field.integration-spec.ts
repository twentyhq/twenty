import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const APP_ID = uuidv4();
const APP_ROLE_ID = uuidv4();
const PERSON_VIEW_ID = uuidv4();
const COMPANY_NAME_VIEW_FIELD_ID = uuidv4();

describe('Sync application should succeed with a lookup view field', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_ID,
      name: 'Lookup view field app',
      description:
        'App shipping a column that shows a field of the related record',
      sourcePath: 'test-lookup-view-field-app',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_ID,
    });
  });

  it('creates a non-canonical many-to-one view field targeting a field of the related object', async () => {
    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_ID,
        roleId: APP_ROLE_ID,
        overrides: {
          views: [
            {
              universalIdentifier: PERSON_VIEW_ID,
              name: 'People with company name',
              objectUniversalIdentifier:
                STANDARD_OBJECTS.person.universalIdentifier,
              type: ViewType.TABLE,
              icon: 'IconTable',
              fields: [
                {
                  universalIdentifier: COMPANY_NAME_VIEW_FIELD_ID,
                  fieldMetadataUniversalIdentifier:
                    STANDARD_OBJECTS.person.fields.company.universalIdentifier,
                  position: 1,
                  isCanonical: false,
                  relationTargetFieldMetadataUniversalIdentifier:
                    STANDARD_OBJECTS.company.fields.name.universalIdentifier,
                },
              ],
            },
          ],
        },
      }),
      expectToFail: false,
    });

    expect(isDefined(errors)).toBe(false);

    const {
      data: { getViews: views },
    } = await findViews({
      expectToFail: false,
      gqlFields: `
        id
        universalIdentifier
        viewFields {
          universalIdentifier
          isCanonical
          relationTargetFieldMetadataId
        }
      `,
    });

    const lookupViewField = views
      .find((view) => view.universalIdentifier === PERSON_VIEW_ID)
      ?.viewFields?.find(
        (viewField) =>
          viewField.universalIdentifier === COMPANY_NAME_VIEW_FIELD_ID,
      );

    const { fields } = await findManyFieldsMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id universalIdentifier',
    });

    const companyNameFieldId = fields.find(
      ({ node }: { node: { universalIdentifier: string } }) =>
        node.universalIdentifier ===
        STANDARD_OBJECTS.company.fields.name.universalIdentifier,
    )?.node.id;

    expect(companyNameFieldId).toBeDefined();
    expect(lookupViewField?.isCanonical).toBe(false);
    expect(lookupViewField?.relationTargetFieldMetadataId).toBe(
      companyNameFieldId,
    );
  });
});
