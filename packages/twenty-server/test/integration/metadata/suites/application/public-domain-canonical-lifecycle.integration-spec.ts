import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { In, type Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { PublicDomainService } from 'src/engine/core-modules/public-domain/public-domain.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

const buildTestDomain = (label: string) =>
  `${label}-${randomUUID()}.example.com`;

const findFunctionsBaseUrl = async (applicationId: string): Promise<string> => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      query FindApplicationFunctionsBaseUrl($applicationId: UUID!) {
        findOneApplication(id: $applicationId) {
          functionsBaseUrl
        }
      }
    `,
    variables: { applicationId },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.findOneApplication.functionsBaseUrl;
};

describe('Public domain canonical lifecycle', () => {
  let publicDomainService: PublicDomainService;
  let applicationRepository: Repository<ApplicationEntity>;
  let publicDomainRepository: Repository<PublicDomainEntity>;
  let workspaceRepository: Repository<WorkspaceEntity>;
  let workspace: WorkspaceEntity;
  let applicationId: string;
  let originalPrimaryPublicDomainId: string | null;
  let createdDomains: string[];

  beforeAll(async () => {
    applicationRepository = getCoreRepository(ApplicationEntity);
    publicDomainRepository = getCoreRepository(PublicDomainEntity);
    workspaceRepository = getCoreRepository(WorkspaceEntity);

    const dnsManagerService = {
      registerHostname: jest.fn().mockResolvedValue(undefined),
      deleteHostnameSilently: jest.fn().mockResolvedValue(undefined),
    } as unknown as DnsManagerService;

    publicDomainService = new PublicDomainService(
      dnsManagerService,
      new WorkspaceScopedRepository(publicDomainRepository),
      publicDomainRepository,
      workspaceRepository,
      applicationRepository,
    );

    workspace = await workspaceRepository.findOneByOrFail({
      id: SEED_APPLE_WORKSPACE_ID,
    });
    applicationId = workspace.workspaceCustomApplicationId;
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const application = await applicationRepository.findOneByOrFail({
      id: applicationId,
      workspaceId: workspace.id,
    });

    originalPrimaryPublicDomainId = application.primaryPublicDomainId;
    createdDomains = [];
  });

  afterEach(async () => {
    await applicationRepository.update(
      { id: applicationId, workspaceId: workspace.id },
      { primaryPublicDomainId: originalPrimaryPublicDomainId },
    );

    if (createdDomains.length > 0) {
      await publicDomainRepository.delete({
        workspaceId: workspace.id,
        domain: In(createdDomains),
      });
    }
  });

  it('should make an app-bound domain canonical when it is created', async () => {
    const domain = buildTestDomain('canonical');

    createdDomains.push(domain);

    const publicDomain = await publicDomainService.createPublicDomain({
      domain,
      workspace,
      applicationId,
    });

    const application = await applicationRepository.findOneByOrFail({
      id: applicationId,
      workspaceId: workspace.id,
    });

    expect(publicDomain.id).toBeDefined();
    expect(application.primaryPublicDomainId).toBe(publicDomain.id);
    await expect(findFunctionsBaseUrl(applicationId)).resolves.toBe(
      `https://${domain}`,
    );
  });

  it('should resolve the newest app-bound domain when a legacy application has no primary', async () => {
    const olderDomain = buildTestDomain('legacy-older');
    const newerDomain = buildTestDomain('legacy-newer');

    createdDomains.push(olderDomain, newerDomain);

    await publicDomainService.createPublicDomain({
      domain: olderDomain,
      workspace,
      applicationId,
    });
    await publicDomainService.createPublicDomain({
      domain: newerDomain,
      workspace,
      applicationId,
    });

    await publicDomainRepository.update(
      { workspaceId: workspace.id, domain: olderDomain },
      { createdAt: new Date('2026-01-01T00:00:00.000Z') },
    );
    await publicDomainRepository.update(
      { workspaceId: workspace.id, domain: newerDomain },
      { createdAt: new Date('2026-01-02T00:00:00.000Z') },
    );
    await applicationRepository.update(
      { id: applicationId, workspaceId: workspace.id },
      { primaryPublicDomainId: null },
    );

    await expect(findFunctionsBaseUrl(applicationId)).resolves.toBe(
      `https://${newerDomain}`,
    );
  });

  it('should promote the newest remaining app-bound domain when the primary is deleted', async () => {
    const fallbackDomain = buildTestDomain('delete-fallback');
    const primaryDomain = buildTestDomain('delete-primary');

    createdDomains.push(fallbackDomain, primaryDomain);

    const fallbackPublicDomain = await publicDomainService.createPublicDomain({
      domain: fallbackDomain,
      workspace,
      applicationId,
    });
    const primaryPublicDomain = await publicDomainService.createPublicDomain({
      domain: primaryDomain,
      workspace,
      applicationId,
    });

    await expect(
      applicationRepository.findOneByOrFail({
        id: applicationId,
        workspaceId: workspace.id,
      }),
    ).resolves.toMatchObject({
      primaryPublicDomainId: primaryPublicDomain.id,
    });

    await publicDomainService.deletePublicDomain({
      domain: primaryDomain,
      workspace,
    });

    const application = await applicationRepository.findOneByOrFail({
      id: applicationId,
      workspaceId: workspace.id,
    });

    await expect(
      publicDomainRepository.findOneByOrFail({
        id: fallbackPublicDomain.id,
        workspaceId: workspace.id,
      }),
    ).resolves.toMatchObject({ domain: fallbackDomain });

    expect(application.primaryPublicDomainId).toBe(fallbackPublicDomain.id);
    await expect(findFunctionsBaseUrl(applicationId)).resolves.toBe(
      `https://${fallbackDomain}`,
    );
  });
});
