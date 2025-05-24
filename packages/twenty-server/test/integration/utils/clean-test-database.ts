import { deleteAllRecords } from 'test/integration/utils/delete-all-records';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { LISTING_NAME_SINGULAR } from 'test/integration/metadata/suites/object-metadata/constants/listing-object.constant';
import { HOUSE_NAME_SINGULAR } from 'test/integration/metadata/suites/object-metadata/constants/house-object.constant';

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
      'task',
      'note',
      'apiKey',
      '_pet',
      '_surveyResult',
    ].map(
      async (objectMetadataNameSingular) =>
        await deleteAllRecords(objectMetadataNameSingular),
    ),
  ]);

  const result = await findManyObjectMetadata({
    input: {
      filter: {
        isCustom: { is: true },
      },
      paging: { first: 1000 },
    },
    gqlFields: `
      id
      nameSingular
    `,
  });

  const objectsToDelete = (result?.objects || []).filter(({ nameSingular }) =>
    [LISTING_NAME_SINGULAR, HOUSE_NAME_SINGULAR].includes(nameSingular),
  );

  for (const objectToDelete of objectsToDelete) {
    await deleteOneObjectMetadata({
      input: { idToDelete: objectToDelete.id },
    });
  }

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
