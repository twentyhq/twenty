import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const APP_ID = uuidv4();
const APP_ROLE_ID = uuidv4();
const COMPANY_VIEW_ID = uuidv4();
const PEOPLE_VIEW_FIELD_ID = uuidv4();
const SCOPE_VIEW_ID = uuidv4();

describe('Sync application should succeed when a view field and its scope view are created together', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_ID,
      name: 'Scope view app',
      description: 'App shipping a scoped one-to-many column',
      sourcePath: 'test-scope-view-app',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_ID,
    });
  });

  it('creates the scope view pointing at a view field created in the same sync', async () => {
    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_ID,
        roleId: APP_ROLE_ID,
        overrides: {
          views: [
            {
              universalIdentifier: COMPANY_VIEW_ID,
              name: 'Accounts with key people',
              objectUniversalIdentifier:
                STANDARD_OBJECTS.company.universalIdentifier,
              type: ViewType.TABLE,
              icon: 'IconTable',
              fields: [
                {
                  universalIdentifier: PEOPLE_VIEW_FIELD_ID,
                  fieldMetadataUniversalIdentifier:
                    STANDARD_OBJECTS.company.fields.people.universalIdentifier,
                  position: 1,
                  settings: { label: 'Key person', recordLimit: 1 },
                },
              ],
            },
            {
              universalIdentifier: SCOPE_VIEW_ID,
              name: 'Key people',
              objectUniversalIdentifier:
                STANDARD_OBJECTS.person.universalIdentifier,
              type: ViewType.TABLE_WIDGET,
              icon: 'IconFilter',
              ownerViewFieldUniversalIdentifier: PEOPLE_VIEW_FIELD_ID,
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
        ownerViewFieldId
        viewFields {
          id
          universalIdentifier
        }
      `,
    });

    const companyView = views.find(
      (view) => view.universalIdentifier === COMPANY_VIEW_ID,
    );
    const scopeView = views.find(
      (view) => view.universalIdentifier === SCOPE_VIEW_ID,
    );

    const peopleViewField = companyView?.viewFields?.find(
      (viewField) => viewField.universalIdentifier === PEOPLE_VIEW_FIELD_ID,
    );

    expect(peopleViewField).toBeDefined();
    expect(scopeView?.ownerViewFieldId).toBe(peopleViewField?.id);
  });
});
