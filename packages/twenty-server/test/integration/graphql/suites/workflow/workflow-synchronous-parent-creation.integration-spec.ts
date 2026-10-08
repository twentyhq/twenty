import { randomUUID } from 'node:crypto';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

const schema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

describe('synchronous workflow parent creation (e2e)', () => {
  it.each(['one', 'many'] as const)(
    'creates the parent before the initial draft through create %s',
    async (operation) => {
      const name = `Synchronous parent ${randomUUID()}`;
      const response = await workflowGraphqlRequest(
        operation === 'one'
          ? 'mutation Create($name: String!) { createWorkflow(data: { name: $name }) { id } }'
          : 'mutation Create($name: String!) { createWorkflows(data: [{ name: $name }, { name: $name }]) { id } }',
        { name },
      );

      const workflows: { id: string }[] = await global.testDataSource.query(
        `SELECT id FROM "${schema}".workflow WHERE name = $1`,
        [name],
      );

      try {
        expect(response.body.errors).toBeUndefined();
        expect(workflows).toHaveLength(operation === 'one' ? 1 : 2);

        for (const workflow of workflows) {
          const rows = await global.testDataSource.query(
            `SELECT w."coreWorkflowId", v.id AS "workspaceVersionId",
                    v."coreWorkflowVersionId", c."workspaceWorkflowId",
                    cv."coreWorkflowId" AS "versionParentId",
                    cv."workspaceWorkflowVersionId", cv.status
             FROM "${schema}".workflow w
             JOIN "${schema}"."workflowVersion" v ON v."workflowId" = w.id
             LEFT JOIN core.workflow c ON c.id = w."coreWorkflowId"
             LEFT JOIN core."workflowVersion" cv ON cv.id = v."coreWorkflowVersionId"
             WHERE w.id = $1`,
            [workflow.id],
          );

          expect(rows).toHaveLength(1);
          expect(rows[0].coreWorkflowId).toBeTruthy();
          expect(rows[0].coreWorkflowVersionId).toBeTruthy();
          expect(rows[0]).toMatchObject({
            workspaceWorkflowId: workflow.id,
            versionParentId: rows[0].coreWorkflowId,
            workspaceWorkflowVersionId: rows[0].workspaceVersionId,
            status: 'DRAFT',
          });
        }
      } finally {
        for (const workflow of workflows) {
          const destroyed = await workflowGraphqlRequest(
            'mutation Destroy($id: UUID!) { destroyWorkflow(id: $id) { id } }',
            { id: workflow.id },
          );

          expect(destroyed.body.errors).toBeUndefined();
        }
      }
    },
  );
});
