import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { planApplicationSync } from 'test/integration/metadata/suites/application/utils/plan-application-sync.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const LEGACY_FIELD_ID = uuidv4();

const TICKET_OBJECT = buildDefaultObjectManifest({
  nameSingular: 'deployPlanTicket',
  namePlural: 'deployPlanTickets',
  labelSingular: 'Deploy Plan Ticket',
  labelPlural: 'Deploy Plan Tickets',
  description: 'A support ticket',
});

const INVOICE_OBJECT = buildDefaultObjectManifest({
  nameSingular: 'deployPlanInvoice',
  namePlural: 'deployPlanInvoices',
  labelSingular: 'Deploy Plan Invoice',
  labelPlural: 'Deploy Plan Invoices',
  description: 'A billing invoice',
});

const RECORD_OBJECT_WITH_LEGACY_FIELD = buildDefaultObjectManifest({
  nameSingular: 'deployPlanRecord',
  namePlural: 'deployPlanRecords',
  labelSingular: 'Deploy Plan Record',
  labelPlural: 'Deploy Plan Records',
  description: 'A record carrying a removable field',
  additionalFields: [
    {
      universalIdentifier: LEGACY_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'legacyNotes',
      label: 'Legacy notes',
    },
  ],
});

const RECORD_OBJECT_WITHOUT_LEGACY_FIELD = {
  ...RECORD_OBJECT_WITH_LEGACY_FIELD,
  fields: RECORD_OBJECT_WITH_LEGACY_FIELD.fields.filter(
    (field) => field.universalIdentifier !== LEGACY_FIELD_ID,
  ),
};

const buildManifest = (overrides?: Partial<Manifest>) =>
  buildBaseManifest({ appId: TEST_APP_ID, roleId: TEST_ROLE_ID, overrides });

const readApplicationVersion = async (): Promise<{
  version: string | null;
  deploySerial: number | null;
}> => {
  const rows = await globalThis.testDataSource.query(
    'SELECT version, "deploySerial" FROM core.application WHERE "universalIdentifier" = $1 AND "workspaceId" = $2',
    [TEST_APP_ID, SEED_APPLE_WORKSPACE_ID],
  );

  return rows[0];
};

describe('Application deploy plan, serial versioning and destructive gate', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Deploy Plan Test Application',
      description: 'App for testing the deploy plan and serial versioning',
      sourcePath: 'application-deploy-plan-and-serial',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('reports additive changes as safe with the next proposed serial', async () => {
    const { data } = await planApplicationSync({
      manifest: buildManifest({ objects: [TICKET_OBJECT] }),
    });

    const plan = data.planApplicationSync;

    expect(plan.isEmpty).toBe(false);
    expect(plan.hasDestructiveActions).toBe(false);
    expect(plan.currentVersion).toBeNull();
    expect(plan.proposedVersion).toBe('0.0.1');
    expect(plan.summary.createCount).toBeGreaterThan(0);
    expect(plan.summary.destructiveCount).toBe(0);
    expect(plan.actions.every((action) => action.severity === 'safe')).toBe(
      true,
    );
  }, 60000);

  it('assigns a monotonic 0.0.N serial that advances on each non-empty deploy', async () => {
    await syncApplication({
      manifest: buildManifest({ objects: [TICKET_OBJECT] }),
      expectToFail: false,
    });

    expect(await readApplicationVersion()).toEqual({
      version: '0.0.1',
      deploySerial: 1,
    });

    await syncApplication({
      manifest: buildManifest({ objects: [TICKET_OBJECT, INVOICE_OBJECT] }),
      expectToFail: false,
    });

    expect(await readApplicationVersion()).toEqual({
      version: '0.0.2',
      deploySerial: 2,
    });
  }, 60000);

  it('treats an unchanged re-deploy as a no-op without advancing the serial', async () => {
    const manifest = buildManifest({ objects: [TICKET_OBJECT] });

    await syncApplication({ manifest, expectToFail: false });

    const plan = (await planApplicationSync({ manifest })).data
      .planApplicationSync;

    expect(plan.isEmpty).toBe(true);
    expect(plan.currentVersion).toBe('0.0.1');
    expect(plan.proposedVersion).toBe('0.0.1');

    await syncApplication({ manifest, expectToFail: false });

    expect(await readApplicationVersion()).toEqual({
      version: '0.0.1',
      deploySerial: 1,
    });
  }, 60000);

  it('flags field removal as destructive and blocks the deploy unless allowDestructive is set', async () => {
    await syncApplication({
      manifest: buildManifest({ objects: [RECORD_OBJECT_WITH_LEGACY_FIELD] }),
      expectToFail: false,
    });

    const manifestWithoutLegacyField = buildManifest({
      objects: [RECORD_OBJECT_WITHOUT_LEGACY_FIELD],
    });

    const plan = (
      await planApplicationSync({ manifest: manifestWithoutLegacyField })
    ).data.planApplicationSync;

    expect(plan.hasDestructiveActions).toBe(true);
    expect(plan.summary.destructiveCount).toBe(1);

    const destructiveAction = plan.actions.find(
      (action) => action.severity === 'destructive',
    );

    expect(destructiveAction).toBeDefined();
    expect(destructiveAction?.type).toBe('delete');
    expect(destructiveAction?.metadataName).toBe('fieldMetadata');
    expect(destructiveAction?.affectedRowCount).toBe(0);

    const blockedResponse = await syncApplication({
      manifest: manifestWithoutLegacyField,
      expectToFail: true,
    });

    expect(JSON.stringify(blockedResponse.errors).toLowerCase()).toContain(
      'destructive',
    );

    await syncApplication({
      manifest: manifestWithoutLegacyField,
      allowDestructive: true,
      expectToFail: false,
    });

    const planAfterApply = (
      await planApplicationSync({ manifest: manifestWithoutLegacyField })
    ).data.planApplicationSync;

    expect(planAfterApply.isEmpty).toBe(true);
  }, 60000);
});
