import { randomUUID } from 'node:crypto';

import { isDefined } from 'twenty-shared/utils';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getObjectMetadataIdByName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-object-metadata-id-by-name.util';
import { type RowAccessPolicy } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SUBJECTS_BEYOND_ONE_BATCH = 1_001;

describe('WorkspaceRepository.findSubjectIdsAdmittedByRowAccessPolicies', () => {
  const recordId = randomUUID();
  const otherRecordId = randomUUID();
  let personObjectMetadata: FlatObjectMetadata;

  // Other suites wipe every person, so the record under test is created here
  beforeAll(async () => {
    for (const personId of [recordId, otherRecordId]) {
      const response = await makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          data: {
            id: personId,
            name: { firstName: 'Row', lastName: 'Access' },
          },
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }

    const { flatObjectMetadataMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatObjectMetadataMaps']);

    const personObjectMetadataId = getObjectMetadataIdByName({
      flatObjectMetadataMaps,
      objectName: 'person',
    });

    if (!isDefined(personObjectMetadataId)) {
      throw new Error('The person object is not seeded');
    }

    personObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: personObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });
  });

  afterAll(async () => {
    for (const personId of [recordId, otherRecordId]) {
      await makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: personId,
        }),
      );
    }
  });

  const buildIdPolicy = (personId: string): RowAccessPolicy => {
    const parameterName = `personId_${randomUUID().replace(/-/g, '')}`;

    return {
      kind: 'gated',
      expression: {
        kind: 'roleFilter',
        tableAlias: 'person',
        flatObjectMetadata: personObjectMetadata,
        recordFilter: { id: { eq: personId } },
        condition: {
          sql: `"person"."id" = :${parameterName}`,
          parameters: { [parameterName]: personId },
        },
      },
    };
  };

  // The app's Set comes from another realm, so it is compared as a list
  const findAdmittedSubjectIds = async ({
    recordId,
    policiesBySubjectId,
  }: {
    recordId: string;
    policiesBySubjectId: Map<string, RowAccessPolicy>;
  }): Promise<string[]> => {
    const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    const admittedSubjectIds =
      await workspaceOrmManager.executeInWorkspaceContext(
        () =>
          workspaceOrmManager
            .getRepository('person', { shouldBypassPermissionChecks: true })
            .findSubjectIdsAdmittedByRowAccessPolicies({
              recordId,
              policiesBySubjectId,
            }),
        buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
      );

    return [...admittedSubjectIds].sort();
  };

  it('evaluates each subject against the record in one pass', async () => {
    const openSubjectId = randomUUID();
    const deniedSubjectId = randomUUID();
    const admittedSubjectId = randomUUID();
    const refusedSubjectId = randomUUID();

    expect(
      await findAdmittedSubjectIds({
        recordId,
        policiesBySubjectId: new Map([
          [openSubjectId, { kind: 'open' }],
          [deniedSubjectId, { kind: 'denied' }],
          [admittedSubjectId, buildIdPolicy(recordId)],
          [refusedSubjectId, buildIdPolicy(otherRecordId)],
        ]),
      }),
    ).toEqual([openSubjectId, admittedSubjectId].sort());
  });

  it('admits nobody to a record that does not exist', async () => {
    expect(
      await findAdmittedSubjectIds({
        recordId: randomUUID(),
        policiesBySubjectId: new Map([[randomUUID(), { kind: 'open' }]]),
      }),
    ).toEqual([]);
  });

  it('checks more subjects than one query can carry', async () => {
    const subjectIds = Array.from({ length: SUBJECTS_BEYOND_ONE_BATCH }, () =>
      randomUUID(),
    );

    expect(
      await findAdmittedSubjectIds({
        recordId,
        policiesBySubjectId: new Map(
          subjectIds.map((subjectId) => [subjectId, buildIdPolicy(recordId)]),
        ),
      }),
    ).toEqual([...subjectIds].sort());
  });
});
