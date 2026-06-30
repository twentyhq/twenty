import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { planApplicationSync } from 'test/integration/metadata/suites/application/utils/plan-application-sync.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { type Manifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const DRIFT_FIELD_ID = uuidv4();

const PLANNED_OBJECT = buildDefaultObjectManifest({
  nameSingular: 'storedPlanRecord',
  namePlural: 'storedPlanRecords',
  labelSingular: 'Stored Plan Record',
  labelPlural: 'Stored Plan Records',
  description: 'The object described by the stored plan',
});

const DECOY_OBJECT = buildDefaultObjectManifest({
  nameSingular: 'storedPlanDecoy',
  namePlural: 'storedPlanDecoys',
  labelSingular: 'Stored Plan Decoy',
  labelPlural: 'Stored Plan Decoys',
  description: 'A decoy object that must be ignored when applying by plan id',
});

const DRIFT_OBJECT_WITH_FIELD = buildDefaultObjectManifest({
  nameSingular: 'driftRecord',
  namePlural: 'driftRecords',
  labelSingular: 'Drift Record',
  labelPlural: 'Drift Records',
  description: 'Baseline object for the drift scenario',
  additionalFields: [
    {
      universalIdentifier: DRIFT_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'extraNotes',
      label: 'Extra notes',
    },
  ],
});

const DRIFT_OBJECT = {
  ...DRIFT_OBJECT_WITH_FIELD,
  fields: DRIFT_OBJECT_WITH_FIELD.fields.filter(
    (field) => field.universalIdentifier !== DRIFT_FIELD_ID,
  ),
};

const buildManifest = (overrides?: Partial<Manifest>) =>
  buildBaseManifest({ appId: TEST_APP_ID, roleId: TEST_ROLE_ID, overrides });

const findObjectNames = async (): Promise<string[]> => {
  const { objects } = await findManyObjectMetadata({
    input: { filter: {}, paging: { first: 100 } },
    gqlFields: 'id nameSingular',
    expectToFail: false,
  });

  return objects.map((object) => object.nameSingular);
};

describe('Application deploy — stored plan apply-by-id and drift', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Stored Plan Test Application',
      description: 'App for testing apply-by-plan-id and drift detection',
      sourcePath: 'application-deploy-stored-plan',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('returns a planId and digest for a non-empty plan', async () => {
    const plan = (
      await planApplicationSync({
        manifest: buildManifest({ objects: [PLANNED_OBJECT] }),
      })
    ).data.planApplicationSync;

    expect(plan.planId).toEqual(expect.any(String));
    expect(plan.planDigest.length).toBeGreaterThan(0);
  }, 60000);

  it('applies exactly the stored plan by id, ignoring the submitted manifest, then consumes it', async () => {
    const plan = (
      await planApplicationSync({
        manifest: buildManifest({ objects: [PLANNED_OBJECT] }),
      })
    ).data.planApplicationSync;

    const planId = plan.planId as string;

    await syncApplication({
      manifest: buildManifest({ objects: [DECOY_OBJECT] }),
      applyPlanId: planId,
      expectToFail: false,
    });

    const objectNames = await findObjectNames();

    expect(objectNames).toContain('storedPlanRecord');
    expect(objectNames).not.toContain('storedPlanDecoy');

    const retry = await syncApplication({
      manifest: buildManifest({ objects: [PLANNED_OBJECT] }),
      applyPlanId: planId,
      expectToFail: true,
    });

    expect(JSON.stringify(retry.errors)).toContain('DEPLOY_PLAN_NOT_FOUND');
  }, 60000);

  it('rejects a stored plan that drifted before apply', async () => {
    await syncApplication({
      manifest: buildManifest({ objects: [DRIFT_OBJECT] }),
      expectToFail: false,
    });

    const plan = (
      await planApplicationSync({
        manifest: buildManifest({ objects: [DRIFT_OBJECT_WITH_FIELD] }),
      })
    ).data.planApplicationSync;

    const planId = plan.planId as string;

    await syncApplication({
      manifest: buildManifest({ objects: [DRIFT_OBJECT_WITH_FIELD] }),
      expectToFail: false,
    });

    const drifted = await syncApplication({
      manifest: buildManifest({ objects: [DRIFT_OBJECT_WITH_FIELD] }),
      applyPlanId: planId,
      expectToFail: true,
    });

    expect(JSON.stringify(drifted.errors)).toContain('DEPLOY_PLAN_DRIFTED');
  }, 60000);
});
