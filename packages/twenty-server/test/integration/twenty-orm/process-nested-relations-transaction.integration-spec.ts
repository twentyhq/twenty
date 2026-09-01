import { randomUUID } from 'node:crypto';

import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import { type ObjectRecord } from 'twenty-shared/types';

import { ProcessNestedRelationsHelper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations.helper';
import { CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

const ROLLBACK_TEST_TRANSACTION = 'ROLLBACK_TEST_TRANSACTION';

describe('ProcessNestedRelationsHelper transaction visibility', () => {
  it('hydrates a relation inserted in the current transaction', async () => {
    const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    const processNestedRelationsHelper =
      getAppProviderByClassName<ProcessNestedRelationsHelper>(
        'ProcessNestedRelationsHelper',
      );

    await expect(
      workspaceOrmManager.executeInWorkspaceContext(
        async () =>
          workspaceOrmManager.runInWorkspaceTransaction(
            async (transactionScope) => {
              const personRepository = transactionScope.getRepository('person');
              const {
                flatObjectMetadataMaps,
                flatFieldMetadataMaps,
                objectIdByNameSingular,
              } = personRepository.getInternalContext();
              const personObjectMetadata =
                findFlatEntityByIdInFlatEntityMapsOrThrow({
                  flatEntityId: objectIdByNameSingular.person,
                  flatEntityMaps: flatObjectMetadataMaps,
                });
              const companyId = randomUUID();
              const companyName = `Uncommitted company ${companyId}`;
              const personRecord: ObjectRecord = {
                id: randomUUID(),
                companyId,
              };

              await transactionScope.getRepository('company').insert({
                id: companyId,
                name: companyName,
              });

              await processNestedRelationsHelper.processNestedRelations({
                flatObjectMetadataMaps,
                flatFieldMetadataMaps,
                parentObjectMetadataItem: personObjectMetadata,
                parentObjectRecords: [personRecord],
                relations: { company: {} },
                limit: QUERY_MAX_RECORDS_FROM_RELATION,
                parentObjectRepository: personRepository,
                selectedFields: {
                  company: {
                    id: true,
                    name: true,
                  },
                },
              });

              expect(personRecord.company).toEqual({
                id: companyId,
                name: companyName,
              });

              throw new Error(ROLLBACK_TEST_TRANSACTION);
            },
          ),
        buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
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
    const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);
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

              const workflowInTransaction = await workflowRepository.findOne({
                where: { id: workflowId },
              });
              const workflowVersionsInTransaction = await transactionScope
                .getRepository<WorkflowVersionWorkspaceEntity>(
                  'workflowVersion',
                  { shouldBypassPermissionChecks: true },
                )
                .find({ where: { workflowId } });

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
            workflowRepository.findOne({
              where: { id: workflowId },
              withDeleted: true,
            }),
            workflowVersionRepository.find({
              where: { workflowId },
              withDeleted: true,
            }),
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
