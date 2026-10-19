import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type BackfillFieldMetadataDefaultIconsCommand } from 'src/database/commands/upgrade-version-command/2-50/2-50-workspace-command-1792432627443-backfill-field-metadata-default-icons.command';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

type FieldRow = { id: string; name: string; icon: string | null };

describe('2-50 workspace command - backfill field metadata default icons (integration)', () => {
  let command: BackfillFieldMetadataDefaultIconsCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let seededCompanyFields: FieldRow[];

  const findCompanyFields = async (): Promise<FieldRow[]> =>
    global.testDataSource.query(
      `SELECT field.id, field.name, field.icon FROM core."fieldMetadata" AS field JOIN core."objectMetadata" AS object ON object.id = field."objectMetadataId" WHERE field."workspaceId" = $1 AND object."nameSingular" = 'company' AND field.name IN ('domainName', 'employees', 'name') ORDER BY field.name`,
      [SEED_APPLE_WORKSPACE_ID],
    );

  const findSeededCompanyField = (name: string) =>
    seededCompanyFields.find((field) => field.name === name) as FieldRow;

  const setFieldIcon = (id: string, icon: string | null) =>
    global.testDataSource.query(
      `UPDATE core."fieldMetadata" SET icon = $1 WHERE id = $2`,
      [icon, id],
    );

  const refreshFieldMaps = () =>
    workspaceCacheService.invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatFieldMetadataMaps',
    ]);

  beforeAll(async () => {
    command =
      getAppProviderByClassName<BackfillFieldMetadataDefaultIconsCommand>(
        'BackfillFieldMetadataDefaultIconsCommand',
      );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    seededCompanyFields = await findCompanyFields();
  });

  beforeEach(async () => {
    await setFieldIcon(findSeededCompanyField('name').id, null);
    await setFieldIcon(findSeededCompanyField('employees').id, '');
    await refreshFieldMaps();
  });

  afterEach(async () => {
    for (const { id, icon } of seededCompanyFields) {
      await setFieldIcon(id, icon);
    }

    await refreshFieldMaps();
  });

  it('should give fields without an icon the default icon of their type', async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findCompanyFields()).toEqual([
      expect.objectContaining({
        name: 'domainName',
        icon: findSeededCompanyField('domainName').icon,
      }),
      expect.objectContaining({ name: 'employees', icon: 'IconNumbers' }),
      expect.objectContaining({ name: 'name', icon: 'IconAbc' }),
    ]);

    const { flatFieldMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
      ]);

    expect(
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: findSeededCompanyField('name').id,
        flatEntityMaps: flatFieldMetadataMaps,
      })?.icon,
    ).toBe('IconAbc');
  });

  it('should leave icons untouched on a dry run', async () => {
    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect(await findCompanyFields()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'employees', icon: '' }),
        expect.objectContaining({ name: 'name', icon: null }),
      ]),
    );
  });
});
