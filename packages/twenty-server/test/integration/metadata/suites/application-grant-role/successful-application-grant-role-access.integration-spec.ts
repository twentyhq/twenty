import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { destroyOneOperation } from 'test/integration/graphql/utils/destroy-one-operation.util';
import { findOneOperation } from 'test/integration/graphql/utils/find-one-operation.util';
import { updateOneOperation } from 'test/integration/graphql/utils/update-one-operation.util';
import { executeDatabaseToolThroughMcp } from 'test/integration/metadata/suites/application-grant-role/utils/execute-database-tool-through-mcp.util';
import { findApplicationRoleIds } from 'test/integration/metadata/suites/application-grant-role/utils/find-application-role-ids.util';
import { removeApplicationGrantRoleTarget } from 'test/integration/metadata/suites/application-grant-role/utils/remove-application-grant-role-target.util';
import {
  cleanupGrantRoleApplications,
  type GrantRoleApplications,
  setupGrantRoleApplications,
} from 'test/integration/metadata/suites/application-grant-role/utils/setup-grant-role-applications.util';
import { findRoles } from 'test/integration/metadata/suites/role/utils/find-roles.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { v4 as uuidv4 } from 'uuid';

jest.setTimeout(240000);

const COMPANY_NAME = `Grant role access company ${uuidv4()}`;

type ReadCompanyTestContext = {
  getToken: (applications: GrantRoleApplications) => string;
};

const readCompanyTestCases: EachTestingContext<ReadCompanyTestContext>[] = [
  {
    title: 'a confined application acting alone',
    context: {
      getToken: ({ tokens }) => tokens.confinedApplicationAlone,
    },
  },
  {
    title: 'a confined application acting for an Admin member',
    context: {
      getToken: ({ tokens }) => tokens.confinedApplicationForAdminMember,
    },
  },
  {
    title: 'a LOCAL application acting alone',
    context: {
      getToken: ({ tokens }) => tokens.localApplicationAlone,
    },
  },
  {
    title: 'twenty-standard acting for an Admin member',
    context: {
      getToken: ({ tokens }) => tokens.twentyStandardForAdminMember,
    },
  },
  {
    title: 'the workspace custom application acting alone',
    context: {
      getToken: ({ tokens }) => tokens.workspaceCustomApplicationAlone,
    },
  },
  {
    title: 'an OAuth-only application acting for an Admin member',
    context: {
      getToken: ({ tokens }) => tokens.oAuthOnlyApplicationForAdminMember,
    },
  },
];

type GrantRoleIdTestContext = {
  getApplicationId: (applications: GrantRoleApplications) => string;
  expectedRole: 'grant' | 'own' | 'none';
};

const grantRoleIdTestCases: EachTestingContext<GrantRoleIdTestContext>[] = [
  {
    title: 'its grant role for a confined application',
    context: {
      getApplicationId: ({ confinedApplicationId }) => confinedApplicationId,
      expectedRole: 'grant',
    },
  },
  {
    title: 'its grant role for a LOCAL application',
    context: {
      getApplicationId: ({ localApplicationId }) => localApplicationId,
      expectedRole: 'grant',
    },
  },
  {
    title: 'its grant role for twenty-standard',
    context: {
      getApplicationId: ({ twentyStandardApplicationId }) =>
        twentyStandardApplicationId,
      expectedRole: 'grant',
    },
  },
  {
    title: 'its own role for the workspace custom application',
    context: {
      getApplicationId: ({ workspaceCustomApplicationId }) =>
        workspaceCustomApplicationId,
      expectedRole: 'own',
    },
  },
  {
    title: 'no role for an OAuth-only application',
    context: {
      getApplicationId: ({ oAuthOnlyApplicationId }) => oAuthOnlyApplicationId,
      expectedRole: 'none',
    },
  },
];

describe('Applications acting with their grant role should succeed', () => {
  let applications: GrantRoleApplications;
  let companyId: string;

  const findCompany = (token: string) =>
    findOneOperation({
      objectMetadataSingularName: 'company',
      gqlFields: 'id name',
      filter: { id: { eq: companyId } },
      token,
      expectToFail: false,
    });

  beforeAll(async () => {
    jest.useRealTimers();

    applications = await setupGrantRoleApplications({
      invoiceObjectNameSingular: 'grantRoleAllowedInvoice',
      invoiceObjectNamePlural: 'grantRoleAllowedInvoices',
    });

    const { data } = await createOneOperation({
      objectMetadataSingularName: 'company',
      input: { name: COMPANY_NAME },
      expectToFail: false,
    });

    companyId = data.createOneResponse.id;
  });

  afterAll(async () => {
    await destroyOneOperation({
      objectMetadataSingularName: 'company',
      recordId: companyId,
    });
    await cleanupGrantRoleApplications(applications);

    jest.useFakeTimers();
  });

  it.each(eachTestingContextFilter(readCompanyTestCases))(
    'should let $title read a company',
    async ({ context }) => {
      const { data, errors } = await findCompany(
        context.getToken(applications),
      );

      expect(errors).toBeUndefined();
      expect(data.findResponse).toEqual({ id: companyId, name: COMPANY_NAME });
    },
  );

  it('should let an agent of a confined application read a company through MCP', async () => {
    const { isError, payload } = await executeDatabaseToolThroughMcp({
      toolName: 'find_one_company',
      toolArguments: { id: companyId },
      token: applications.tokens.confinedApplicationAgent,
    });

    expect(isError).toBe(false);
    expect(payload).toMatchObject({
      success: true,
      result: {
        records: [
          expect.objectContaining({ id: companyId, name: COMPANY_NAME }),
        ],
      },
    });
  });

  it('should let an agent of a confined application update, through MCP, a person both its role and the application write', async () => {
    const { data: createData } = await createOneOperation({
      objectMetadataSingularName: 'person',
      input: { name: { firstName: 'Grant', lastName: 'Role' } },
      expectToFail: false,
    });
    const personId = createData.createOneResponse.id;

    const { isError, payload } = await executeDatabaseToolThroughMcp({
      toolName: 'update_one_person',
      toolArguments: { id: personId, jobTitle: 'Updated by an agent' },
      token: applications.tokens.confinedApplicationAgent,
    });

    expect(isError).toBe(false);
    expect(payload).toMatchObject({ success: true });

    await destroyOneOperation({
      objectMetadataSingularName: 'person',
      recordId: personId,
    });
  });

  it('should let a confined application destroy a record of its own object, where destroying is disabled', async () => {
    const { invoiceObjectNameSingular, tokens } = applications;

    const { data: createData } = await createOneOperation({
      objectMetadataSingularName: invoiceObjectNameSingular,
      input: {},
      token: tokens.confinedApplicationAlone,
      expectToFail: false,
    });
    const invoiceId = createData.createOneResponse.id;

    const { data, errors } = await destroyOneOperation({
      objectMetadataSingularName: invoiceObjectNameSingular,
      recordId: invoiceId,
      token: tokens.confinedApplicationAlone,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data.destroyOneResponse).toEqual({ id: invoiceId });
  });

  it('should let twenty-standard acting for an Admin member update a company', async () => {
    const updatedCompanyName = `${COMPANY_NAME} updated`;

    const { data, errors } = await updateOneOperation({
      objectMetadataSingularName: 'company',
      recordId: companyId,
      input: { name: updatedCompanyName },
      gqlFields: 'id name',
      token: applications.tokens.twentyStandardForAdminMember,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data.updateOneResponse).toEqual({
      id: companyId,
      name: updatedCompanyName,
    });

    await updateOneOperation({
      objectMetadataSingularName: 'company',
      recordId: companyId,
      input: { name: COMPANY_NAME },
      expectToFail: false,
    });
  });

  it.each(eachTestingContextFilter(grantRoleIdTestCases))(
    'should expose $title as the role it acts with',
    async ({ context }) => {
      const { defaultRoleId, grantRoleId } = await findApplicationRoleIds({
        input: { id: context.getApplicationId(applications) },
      });

      if (context.expectedRole === 'none') {
        expect(grantRoleId).toBeNull();

        return;
      }

      if (context.expectedRole === 'own') {
        expect(grantRoleId).toBe(defaultRoleId);

        return;
      }

      expect(grantRoleId).not.toBe(defaultRoleId);

      const { data } = await findRoles({
        gqlFields: 'id applicationId isEditable',
        expectToFail: false,
      });

      expect(data.getRoles.find(({ id }) => id === grantRoleId)).toEqual({
        id: grantRoleId,
        applicationId: applications.workspaceCustomApplicationId,
        isEditable: false,
      });
    },
  );

  describe('once a confined application has lost its grant role target', () => {
    let restoreGrantRoleTarget: () => Promise<void>;

    beforeAll(async () => {
      restoreGrantRoleTarget = await removeApplicationGrantRoleTarget({
        applicationId: applications.confinedApplicationId,
      });
    });

    afterAll(async () => {
      await restoreGrantRoleTarget();
    });

    it('should still let it read a company, with its requested role', async () => {
      const { data, errors } = await findCompany(
        applications.tokens.confinedApplicationAlone,
      );

      expect(errors).toBeUndefined();
      expect(data.findResponse).toEqual({ id: companyId, name: COMPANY_NAME });
    });

    it('should expose its requested role as the role it acts with', async () => {
      const { defaultRoleId, grantRoleId } = await findApplicationRoleIds({
        input: { id: applications.confinedApplicationId },
      });

      expect(grantRoleId).toBe(defaultRoleId);
    });
  });
});
