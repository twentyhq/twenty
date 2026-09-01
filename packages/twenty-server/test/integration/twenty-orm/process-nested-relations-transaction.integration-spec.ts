import { randomUUID } from 'node:crypto';

import { CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';
import { CommonFindOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-one-query-runner.service';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { fromApiKeyEntityToFlat } from 'src/engine/core-modules/api-key/utils/from-api-key-entity-to-flat.util';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

const ROLLBACK_TEST_TRANSACTION = 'ROLLBACK_TEST_TRANSACTION';

describe('CommonFindOneQueryRunnerService transaction visibility', () => {
  it('hydrates a relation inserted in the current transaction', async () => {
    const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    const commonFindOneQueryRunnerService =
      getAppProviderByClassName<CommonFindOneQueryRunnerService>(
        'CommonFindOneQueryRunnerService',
      );
    const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);

    await expect(
      workspaceOrmManager.executeInWorkspaceContext(
        async () =>
          workspaceOrmManager.runInWorkspaceTransaction(
            async (transactionScope) => {
              const rolePermissionConfig = {
                shouldBypassPermissionChecks: true,
              } as const;
              const personRepository = transactionScope.getRepository(
                'person',
                rolePermissionConfig,
              );
              const {
                flatObjectMetadataMaps,
                flatFieldMetadataMaps,
                flatIndexMaps,
                objectIdByNameSingular,
              } = personRepository.getInternalContext();
              const personObjectMetadata =
                findFlatEntityByIdInFlatEntityMapsOrThrow({
                  flatEntityId: objectIdByNameSingular.person,
                  flatEntityMaps: flatObjectMetadataMaps,
                });
              const companyId = randomUUID();
              const personId = randomUUID();
              const companyName = `Uncommitted company ${companyId}`;

              await transactionScope
                .getRepository('company', rolePermissionConfig)
                .insert({
                  id: companyId,
                  name: companyName,
                });
              await personRepository.insert({
                id: personId,
                companyId,
              });

              const { results: person } =
                await commonFindOneQueryRunnerService.execute(
                  {
                    filter: { id: { eq: personId } },
                    selectedFields: {
                      id: true,
                      company: { id: true, name: true },
                    },
                  },
                  {
                    authContext,
                    flatObjectMetadata: personObjectMetadata,
                    flatObjectMetadataMaps,
                    flatFieldMetadataMaps,
                    flatIndexMaps,
                    objectIdByNameSingular,
                    rolePermissionConfig,
                    transactionScope,
                  },
                );

              expect(person).toMatchObject({
                id: personId,
                companyId,
                company: {
                  id: companyId,
                  name: companyName,
                },
              });

              throw new Error(ROLLBACK_TEST_TRANSACTION);
            },
          ),
        authContext,
        { lite: true },
      ),
    ).rejects.toThrow(ROLLBACK_TEST_TRANSACTION);
  }, 60000);
});

describe('CommonCreateOneQueryRunnerService transaction scope', () => {
  it('creates workflow hook records in the outer transaction and rolls them back together', async () => {
    const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    const commonCreateOneQueryRunnerService =
      getAppProviderByClassName<CommonCreateOneQueryRunnerService>(
        'CommonCreateOneQueryRunnerService',
      );
    const [apiKey, workspace] = await Promise.all([
      getCoreRepository<ApiKeyEntity>(ApiKeyEntity).findOneByOrFail({
        id: API_KEY_DATA_SEED_IDS.ID_1,
      }),
      getCoreRepository<WorkspaceEntity>(WorkspaceEntity).findOneByOrFail({
        id: SEED_APPLE_WORKSPACE_ID,
      }),
    ]);
    const authContext = buildApiKeyAuthContext({
      apiKey: fromApiKeyEntityToFlat(apiKey),
      workspace: fromWorkspaceEntityToFlat(workspace),
    });
    const workflowId = randomUUID();
    const workflowName = `Rolled back workflow ${workflowId}`;

    await expect(
      workspaceOrmManager.executeInWorkspaceContext(
        async () =>
          workspaceOrmManager.runInWorkspaceTransaction(
            async (transactionScope) => {
              const workflowRepository =
                transactionScope.getRepository<WorkflowWorkspaceEntity>(
                  'workflow',
                  { shouldBypassPermissionChecks: true },
                );
              const {
                flatObjectMetadataMaps,
                flatFieldMetadataMaps,
                flatIndexMaps,
                objectIdByNameSingular,
              } = workflowRepository.getInternalContext();
              const workflowObjectMetadata =
                findFlatEntityByIdInFlatEntityMapsOrThrow({
                  flatEntityId: objectIdByNameSingular.workflow,
                  flatEntityMaps: flatObjectMetadataMaps,
                });

              const { results: workflow } =
                await commonCreateOneQueryRunnerService.execute(
                  {
                    data: { id: workflowId, name: workflowName },
                    selectedFields: { id: true, name: true },
                  },
                  {
                    authContext,
                    flatObjectMetadata: workflowObjectMetadata,
                    flatObjectMetadataMaps,
                    flatFieldMetadataMaps,
                    flatIndexMaps,
                    objectIdByNameSingular,
                    rolePermissionConfig: {
                      shouldBypassPermissionChecks: true,
                    },
                    transactionScope,
                  },
                );

              expect(workflow).toMatchObject({
                id: workflowId,
                name: workflowName,
              });

              const workflowInTransaction = await workflowRepository
                .createQueryBuilder('workflow')
                .where('"workflow"."id" = :workflowId', { workflowId })
                .getOne<WorkflowWorkspaceEntity>();
              const workflowVersionsInTransaction = await transactionScope
                .getRepository<WorkflowVersionWorkspaceEntity>(
                  'workflowVersion',
                  { shouldBypassPermissionChecks: true },
                )
                .createQueryBuilder('workflowVersion')
                .where('"workflowVersion"."workflowId" = :workflowId', {
                  workflowId,
                })
                .getMany<WorkflowVersionWorkspaceEntity>();

              expect(workflowInTransaction).toMatchObject({ id: workflowId });
              expect(workflowVersionsInTransaction).toHaveLength(1);
              expect(workflowVersionsInTransaction[0]).toMatchObject({
                workflowId,
                status: WorkflowVersionStatus.DRAFT,
              });
              expect(
                workflowVersionsInTransaction[0].coreWorkflowVersionId,
              ).toEqual(expect.any(String));

              const coreWorkflowVersionsInTransaction =
                await transactionScope.executeRawQuery(
                  `SELECT "id", "workflowId", "status"
                   FROM core."workflowVersion"
                   WHERE "workspaceId" = $1 AND "workflowId" = $2`,
                  [SEED_APPLE_WORKSPACE_ID, workflowId],
                );

              expect(coreWorkflowVersionsInTransaction).toEqual([
                {
                  id: workflowVersionsInTransaction[0].coreWorkflowVersionId,
                  workflowId,
                  status: WorkflowVersionStatus.DRAFT,
                },
              ]);

              throw new Error(ROLLBACK_TEST_TRANSACTION);
            },
          ),
        authContext,
        { lite: true },
      ),
    ).rejects.toThrow(ROLLBACK_TEST_TRANSACTION);

    const [workflowAfterRollback, workflowVersionsAfterRollback] =
      await workspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workflowRepository =
            workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
              'workflow',
              { shouldBypassPermissionChecks: true },
            );
          const workflowVersionRepository =
            workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
              'workflowVersion',
              { shouldBypassPermissionChecks: true },
            );

          return Promise.all([
            workflowRepository
              .createQueryBuilder('workflow')
              .withDeleted()
              .where('"workflow"."id" = :workflowId', { workflowId })
              .getOne<WorkflowWorkspaceEntity>(),
            workflowVersionRepository
              .createQueryBuilder('workflowVersion')
              .withDeleted()
              .where('"workflowVersion"."workflowId" = :workflowId', {
                workflowId,
              })
              .getMany<WorkflowVersionWorkspaceEntity>(),
          ]);
        },
        authContext,
        { lite: true },
      );
    const coreWorkflowVersionsAfterRollback = await global.testDataSource.query(
      `SELECT "id"
         FROM core."workflowVersion"
         WHERE "workspaceId" = $1 AND "workflowId" = $2`,
      [SEED_APPLE_WORKSPACE_ID, workflowId],
    );

    expect(workflowAfterRollback).toBeNull();
    expect(workflowVersionsAfterRollback).toEqual([]);
    expect(coreWorkflowVersionsAfterRollback).toEqual([]);
  }, 60000);
});
