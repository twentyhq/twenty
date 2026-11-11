import { randomUUID } from 'node:crypto';

import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { destroyOneOperation } from 'test/integration/graphql/utils/destroy-one-operation.util';
import { executeDatabaseToolThroughMcp } from 'test/integration/metadata/suites/application-grant-role/utils/execute-database-tool-through-mcp.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findOneOperation } from 'test/integration/graphql/utils/find-one-operation.util';
import { updateOneOperation } from 'test/integration/graphql/utils/update-one-operation.util';
import {
  cleanupGrantRoleApplications,
  type GrantRoleApplications,
  setupGrantRoleApplications,
} from 'test/integration/metadata/suites/application-grant-role/utils/setup-grant-role-applications.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

jest.setTimeout(240000);

const COMPANY_NAME = `Grant role refused company ${randomUUID()}`;

type TestSetup = {
  applications: GrantRoleApplications;
  companyId: string;
  invoiceId: string;
  personObjectMetadataId: string;
};

type TestContext = {
  attempt: (setup: TestSetup) => Promise<{ errors: BaseGraphQLError[] }>;
  readTarget?: (setup: TestSetup) => Promise<unknown>;
};

const updateCompany = ({ companyId }: TestSetup, token: string) =>
  updateOneOperation({
    objectMetadataSingularName: 'company',
    recordId: companyId,
    input: { name: `${COMPANY_NAME} renamed` },
    token,
    expectToFail: true,
  });

const readCompanyName = async ({ companyId }: TestSetup) => {
  const { data } = await findOneOperation({
    objectMetadataSingularName: 'company',
    gqlFields: 'name',
    filter: { id: { eq: companyId } },
  });

  return data.findResponse;
};

const destroyInvoice = (
  { applications, invoiceId }: TestSetup,
  token?: string,
) =>
  destroyOneOperation({
    objectMetadataSingularName: applications.invoiceObjectNameSingular,
    recordId: invoiceId,
    token,
    expectToFail: true,
  });

const readInvoice = async ({ applications, invoiceId }: TestSetup) => {
  const { data } = await findOneOperation({
    objectMetadataSingularName: applications.invoiceObjectNameSingular,
    gqlFields: 'id',
    filter: { id: { eq: invoiceId } },
  });

  return data.findResponse;
};

const testCases: EachTestingContext<TestContext>[] = [
  {
    title:
      'a confined application acting alone updating a company its requested role only reads',
    context: {
      attempt: (setup) =>
        updateCompany(
          setup,
          setup.applications.tokens.confinedApplicationAlone,
        ),
      readTarget: readCompanyName,
    },
  },
  {
    title:
      'a confined application acting for an Admin member updating a company its requested role only reads',
    context: {
      attempt: (setup) =>
        updateCompany(
          setup,
          setup.applications.tokens.confinedApplicationForAdminMember,
        ),
      readTarget: readCompanyName,
    },
  },
  {
    title: 'a LOCAL application acting alone updating a company it only reads',
    context: {
      attempt: (setup) =>
        updateCompany(setup, setup.applications.tokens.localApplicationAlone),
      readTarget: readCompanyName,
    },
  },
  {
    title:
      'an Admin member acting through a confined application destroying a record of its object, where destroying is disabled',
    context: {
      attempt: (setup) =>
        destroyInvoice(
          setup,
          setup.applications.tokens.confinedApplicationForAdminMember,
        ),
      readTarget: readInvoice,
    },
  },
  {
    title:
      'an Admin member destroying a record of a confined application object, where destroying is disabled',
    context: {
      attempt: (setup) => destroyInvoice(setup),
      readTarget: readInvoice,
    },
  },
  {
    title:
      'twenty-standard acting for an Admin member creating a record share, where creating is disabled',
    context: {
      attempt: ({ applications, personObjectMetadataId }) =>
        createOneOperation({
          objectMetadataSingularName: 'recordShare',
          input: {
            recordId: randomUUID(),
            objectMetadataId: personObjectMetadataId,
            principalId: randomUUID(),
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            accessLevel: RecordShareAccessLevel.READ,
            rowCause: RecordShareRowCause.MANUAL,
            sourceId: randomUUID(),
          },
          token: applications.tokens.twentyStandardForAdminMember,
          expectToFail: true,
        }),
    },
  },
  {
    title: 'an OAuth-only application acting alone reading a company',
    context: {
      attempt: ({ applications, companyId }) =>
        findOneOperation({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          filter: { id: { eq: companyId } },
          token: applications.tokens.oAuthOnlyApplicationAlone,
          expectToFail: true,
        }),
    },
  },
];

describe('Applications acting with their grant role should fail', () => {
  let setup: TestSetup;

  beforeAll(async () => {
    jest.useRealTimers();

    const applications = await setupGrantRoleApplications({
      invoiceObjectNameSingular: 'grantRoleRefusedInvoice',
      invoiceObjectNamePlural: 'grantRoleRefusedInvoices',
    });

    const { data: companyData } = await createOneOperation({
      objectMetadataSingularName: 'company',
      input: { name: COMPANY_NAME },
      expectToFail: false,
    });
    const { data: invoiceData } = await createOneOperation({
      objectMetadataSingularName: applications.invoiceObjectNameSingular,
      input: {},
      token: applications.tokens.confinedApplicationAlone,
      expectToFail: false,
    });

    setup = {
      applications,
      companyId: companyData.createOneResponse.id,
      invoiceId: invoiceData.createOneResponse.id,
      personObjectMetadataId: await findObjectMetadataIdByName('person'),
    };
  });

  afterAll(async () => {
    await destroyOneOperation({
      objectMetadataSingularName: 'company',
      recordId: setup.companyId,
    });
    await cleanupGrantRoleApplications(setup.applications);

    jest.useFakeTimers();
  });

  it.each(eachTestingContextFilter(testCases))(
    'should refuse $title',
    async ({ context }) => {
      const targetBefore = await context.readTarget?.(setup);

      const { errors } = await context.attempt(setup);

      expectOneNotInternalServerErrorSnapshot({ errors });

      expect(await context.readTarget?.(setup)).toEqual(targetBefore);
    },
  );

  it('should refuse an agent of a confined application updating, through MCP, a company its own role writes', async () => {
    const companyNameBefore = await readCompanyName(setup);

    const { isError, payload } = await executeDatabaseToolThroughMcp({
      toolName: 'update_one_company',
      toolArguments: { id: setup.companyId, name: `${COMPANY_NAME} renamed` },
      token: setup.applications.tokens.confinedApplicationAgent,
    });

    expect(isError).toBe(true);
    expect(payload).toMatchObject({
      success: false,
      message: 'Tool "update_one_company" not found',
    });
    expect(await readCompanyName(setup)).toEqual(companyNameBefore);
  });
});
