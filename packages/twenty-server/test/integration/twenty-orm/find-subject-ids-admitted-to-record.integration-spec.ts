import { randomUUID } from 'node:crypto';

import { isDefined } from 'twenty-shared/utils';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getObjectMetadataIdByName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-object-metadata-id-by-name.util';
import { type RowAccessPolicySubject } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SUBJECTS_BEYOND_ONE_BATCH = 1_001;

describe('WorkspaceRepository.findSubjectIdsAdmittedToRecord', () => {
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

  const openSubject: RowAccessPolicySubject = {
    isSystemContext: false,
    objectsPermissions: undefined,
    principalIds: undefined,
    workspaceMemberId: undefined,
    isOwningApplication: () => false,
    resolveRowLevelPermissionRecordFilter: () => null,
  };

  const buildIdSubject = (personId: string): RowAccessPolicySubject => ({
    ...openSubject,
    resolveRowLevelPermissionRecordFilter: () => ({ id: { eq: personId } }),
  });

  // The app's Set comes from another realm, so it is compared as a list
  const findAdmittedSubjectIds = async ({
    recordId,
    subjectsById,
  }: {
    recordId: string;
    subjectsById: Map<string, RowAccessPolicySubject>;
  }): Promise<string[]> => {
    const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    const admittedSubjectIds =
      await workspaceOrmManager.executeInWorkspaceContext(
        () =>
          workspaceOrmManager
            .getRepository('person', { shouldBypassPermissionChecks: true })
            .findSubjectIdsAdmittedToRecord({
              recordId,
              subjectsById,
              operationTypes: ['select', 'update'],
            }),
        buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
      );

    return [...admittedSubjectIds].sort();
  };

  it('admits each subject the record is open to for every operation, in one pass', async () => {
    const openSubjectId = randomUUID();
    const deniedSubjectId = randomUUID();
    const admittedSubjectId = randomUUID();
    const refusedSubjectId = randomUUID();
    const readOnlySubjectId = randomUUID();

    expect(
      await findAdmittedSubjectIds({
        recordId,
        subjectsById: new Map([
          [openSubjectId, openSubject],
          [deniedSubjectId, { ...openSubject, objectsPermissions: {} }],
          [admittedSubjectId, buildIdSubject(recordId)],
          [refusedSubjectId, buildIdSubject(otherRecordId)],
          [
            readOnlySubjectId,
            {
              ...openSubject,
              objectsPermissions: {
                [personObjectMetadata.id]: {
                  canReadObjectRecords: true,
                  canUpdateObjectRecords: false,
                  canSoftDeleteObjectRecords: false,
                  canDestroyObjectRecords: false,
                  restrictedFields: {},
                  rowLevelPermissionPredicates: [],
                  rowLevelPermissionPredicateGroups: [],
                },
              },
            },
          ],
        ]),
      }),
    ).toEqual([openSubjectId, admittedSubjectId].sort());
  });

  it('admits nobody to a record that does not exist', async () => {
    expect(
      await findAdmittedSubjectIds({
        recordId: randomUUID(),
        subjectsById: new Map([[randomUUID(), openSubject]]),
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
        subjectsById: new Map(
          subjectIds.map((subjectId) => [subjectId, buildIdSubject(recordId)]),
        ),
      }),
    ).toEqual([...subjectIds].sort());
  });
});
