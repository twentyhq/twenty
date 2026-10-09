import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
  ViewType,
} from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { v4 } from 'uuid';

const APPLICATION_ID = v4();
const ROLE_ID = v4();
const MORPH_ID = v4();
const TARGET_ID = v4();
const INVERSE_ID = v4();
const VIEW_ID = v4();
const VIEW_FIELD_ID = v4();

const manifest = buildBaseManifest({
  appId: APPLICATION_ID,
  roleId: ROLE_ID,
  overrides: {
    roles: [{ universalIdentifier: ROLE_ID, label: 'Legacy morph role' }],
    fields: [
      {
        universalIdentifier: TARGET_ID,
        objectUniversalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
        type: FieldMetadataType.MORPH_RELATION,
        name: 'legacyRelatedCompany',
        label: 'Legacy related',
        morphId: MORPH_ID,
        relationTargetObjectMetadataUniversalIdentifier:
          STANDARD_OBJECTS.company.universalIdentifier,
        relationTargetFieldMetadataUniversalIdentifier: INVERSE_ID,
        universalSettings: {
          relationType: RelationType.MANY_TO_ONE,
          joinColumnName: 'legacyRelatedCompanyId',
          onDelete: RelationOnDeleteAction.SET_NULL,
        },
      },
      {
        universalIdentifier: INVERSE_ID,
        objectUniversalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
        type: FieldMetadataType.RELATION,
        name: 'legacyRelatedPeople',
        label: 'Legacy related people',
        relationTargetObjectMetadataUniversalIdentifier:
          STANDARD_OBJECTS.person.universalIdentifier,
        relationTargetFieldMetadataUniversalIdentifier: TARGET_ID,
        universalSettings: { relationType: RelationType.ONE_TO_MANY },
      },
    ],
    views: [
      {
        universalIdentifier: VIEW_ID,
        objectUniversalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
        type: ViewType.TABLE,
        name: 'Legacy morph people',
        icon: 'IconTable',
        fields: [
          {
            universalIdentifier: VIEW_FIELD_ID,
            fieldMetadataUniversalIdentifier: TARGET_ID,
            position: 0,
            isVisible: true,
            size: 150,
          },
        ],
      },
    ],
  },
});

describe('Legacy morph application manifests', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_ID,
      name: 'Legacy morph app',
      description: 'Legacy morph application',
      sourcePath: 'test-legacy-morph-app',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_ID,
    });
  }, 60000);

  it('preserves the logical field and its saved column across repeated imports on standard objects', async () => {
    let ownerId: string | undefined;
    for (let iteration = 0; iteration < 2; iteration++) {
      const { errors } = await syncApplication({
        manifest,
        expectToFail: false,
      });
      expect(errors).toBeUndefined();
      const objects = await findManyObjectMetadataWithIndexes({
        expectToFail: false,
      });
      const person = objects.find(
        (object) =>
          object.universalIdentifier ===
          STANDARD_OBJECTS.person.universalIdentifier,
      );
      const owner = person?.fieldsList.find(
        (field) => field.universalIdentifier === MORPH_ID,
      );
      assertIsDefinedOrThrow(owner);
      expect(owner.name).toBe('legacyRelated');
      if (iteration === 0) ownerId = owner.id;
      expect(owner.id).toBe(ownerId);
      const { data: views } = await findViews({ expectToFail: false });
      const view = views.getViews.find(
        (candidate) => candidate.universalIdentifier === VIEW_ID,
      );
      assertIsDefinedOrThrow(view);
      const { data: columns } = await findViewFields({
        viewId: view.id,
        expectToFail: false,
      });
      expect(
        columns.getViewFields.find(
          (column) => column.universalIdentifier === VIEW_FIELD_ID,
        )?.fieldMetadataId,
      ).toBe(ownerId);
    }
  }, 60000);
});
