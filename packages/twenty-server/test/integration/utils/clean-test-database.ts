import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

import { SEED_APPLE_WORKSPACE_ID } from 'src/database/typeorm-seeds/core/workspaces';

export const cleanTestDatabase = async ({ seed }: { seed: boolean }) => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      "Don't run this 'setupTest' function in a non test environment",
    );
  }

  await Promise.all([
    ...[
      'person',
      'company',
      'opportunity',
      'workspaceMember',
      '_pet',
      '_surveyResult',
    ].map(
      async (objectMetadataNameSingular) =>
        await deleteAllRecords(objectMetadataNameSingular),
    ),
  ]);

  if (!seed) {
    return;
  }

  // @ts-expect-error legacy noImplicitAny
  const mainDataSource = global.typeOrmService.getMainDataSource();

  const dataSourceMetadata =
    // @ts-expect-error legacy noImplicitAny
    await global.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
      SEED_APPLE_WORKSPACE_ID,
    );

  // @ts-expect-error legacy noImplicitAny
  await global.dataSeedWorkspaceCommand.seedRecords({
    mainDataSource,
    dataSourceMetadata,
  });
};
