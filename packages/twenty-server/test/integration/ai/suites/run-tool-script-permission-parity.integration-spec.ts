import { randomUUID } from 'node:crypto';

import { executeToolThroughMcp } from 'test/integration/ai/suites/utils/execute-tool-through-mcp.util';
import { runToolScriptThroughMcp } from 'test/integration/ai/suites/utils/run-tool-script-through-mcp.util';
import { createCustomRoleWithObjectPermissions } from 'test/integration/graphql/utils/create-custom-role-with-object-permissions.util';
import {
  type CompanyNameRlsRoleSetup,
  cleanupCompanyNameRlsRole,
  setupCompanyNameRlsRole,
} from 'test/integration/graphql/utils/setup-company-name-rls-role.util';
import {
  type RlsCompanyRelationRecords,
  cleanupRlsCompanyRelationRecords,
  setupRlsCompanyRelationRecords,
} from 'test/integration/graphql/utils/setup-rls-company-relation-records.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type FindManyResult = { records: { id: string }[] };

const readIdsThroughExecuteTool = async (
  toolName: string,
  toolArguments: Record<string, unknown>,
) => {
  const output = await executeToolThroughMcp<FindManyResult>({
    toolName,
    toolArguments,
    token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    expectToFail: false,
  });

  return (output.result?.records ?? []).map(({ id }) => id);
};

const readIdsThroughScript = async (
  toolName: string,
  toolArguments: Record<string, unknown>,
) => {
  const output = await runToolScriptThroughMcp({
    code: `
import json

found = await call_tool("${toolName}", json.loads(${JSON.stringify(JSON.stringify(toolArguments))}))
[record["id"] for record in found["records"]]
`,
    token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    expectToFail: false,
  });

  return output.result as string[];
};

describe('run_tool_script reads with the caller permissions, like execute_tool', () => {
  describe('when the role cannot read an object', () => {
    let customRoleId: string;
    let memberRoleId: string;

    beforeAll(async () => {
      memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

      ({ roleId: customRoleId } = await createCustomRoleWithObjectPermissions({
        label: `Code mode no company ${randomUUID()}`,
        hasAllObjectRecordsReadPermission: false,
        canReadPerson: true,
        canReadCompany: false,
      }));

      await updateWorkspaceMemberRole({
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          roleId: customRoleId,
        },
        expectToFail: false,
      });
    });

    afterAll(async () => {
      await updateWorkspaceMemberRole({
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          roleId: memberRoleId,
        },
        expectToFail: false,
      });
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: customRoleId },
      });
    });

    it('refuses the unreadable object with the same error', async () => {
      const toolArguments = { select: ['id'], limit: 5 };

      const executeToolOutput = await executeToolThroughMcp({
        toolName: 'find_many_companies',
        toolArguments,
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        expectToFail: true,
      });

      const scriptOutput = await runToolScriptThroughMcp({
        code: `await call_tool("find_many_companies", ${JSON.stringify(toolArguments)})`,
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        expectToFail: true,
      });

      expect(executeToolOutput.error).toBeDefined();
      expect(scriptOutput.error).toContain(
        `Tool "find_many_companies" failed: ${executeToolOutput.error}`,
      );
    });

    it('returns the same records for the readable object', async () => {
      const toolArguments = {
        select: ['id'],
        orderBy: [{ id: 'AscNullsLast' }],
        limit: 5,
      };

      const idsThroughExecuteTool = await readIdsThroughExecuteTool(
        'find_many_people',
        toolArguments,
      );
      const idsThroughScript = await readIdsThroughScript(
        'find_many_people',
        toolArguments,
      );

      expect(idsThroughExecuteTool.length).toBeGreaterThan(0);
      expect(idsThroughScript).toEqual(idsThroughExecuteTool);
    });
  });

  describe('when a row-level predicate hides records', () => {
    let rlsRole: CompanyNameRlsRoleSetup;
    let records: RlsCompanyRelationRecords;

    beforeAll(async () => {
      rlsRole = await setupCompanyNameRlsRole({
        label: 'Code mode RLS parity role',
        description: 'Role for comparing run_tool_script and execute_tool',
      });

      records = await setupRlsCompanyRelationRecords({
        companyNamePrefix: `Code mode RLS ${randomUUID().slice(0, 8)}`,
        createdAt: '2019-07-15T10:00:00.000Z',
      });
    });

    afterAll(async () => {
      await cleanupRlsCompanyRelationRecords(records);
      await cleanupCompanyNameRlsRole(rlsRole);
    });

    it('filters the hidden record out of both', async () => {
      const toolArguments = {
        select: ['id'],
        name: { in: [records.visibleCompanyName, records.hiddenCompanyName] },
      };

      const idsThroughExecuteTool = await readIdsThroughExecuteTool(
        'find_many_companies',
        toolArguments,
      );
      const idsThroughScript = await readIdsThroughScript(
        'find_many_companies',
        toolArguments,
      );

      expect(idsThroughExecuteTool).toEqual([records.visibleCompanyId]);
      expect(idsThroughScript).toEqual(idsThroughExecuteTool);
    });
  });
});
