import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { In, type Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
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

describe('Application functions base URL resolution', () => {
  let applicationRepository: Repository<ApplicationEntity>;
  let publicDomainRepository: Repository<PublicDomainEntity>;
  let workspaceRepository: Repository<WorkspaceEntity>;
  let workspace: WorkspaceEntity;
  let applicationId: string;
  let createdDomains: string[] = [];

  const seedPublicDomain = async ({
    domain,
    createdAt,
    isValidated = true,
  }: {
    domain: string;
    createdAt: Date;
    isValidated?: boolean;
  }): Promise<PublicDomainEntity> => {
    createdDomains.push(domain);

    const publicDomain = await publicDomainRepository.save({
      domain,
      applicationId,
      workspaceId: workspace.id,
      isValidated,
    });

    await publicDomainRepository.update({ id: publicDomain.id }, { createdAt });

    return publicDomain;
  };

  beforeAll(async () => {
    applicationRepository = getCoreRepository(ApplicationEntity);
    publicDomainRepository = getCoreRepository(PublicDomainEntity);
    workspaceRepository = getCoreRepository(WorkspaceEntity);

    workspace = await workspaceRepository.findOneByOrFail({
      id: SEED_APPLE_WORKSPACE_ID,
    });

    const application = await applicationRepository.save({
      universalIdentifier: randomUUID(),
      name: 'Functions base URL integration test application',
      sourcePath: 'test/functions-base-url',
      workspaceId: workspace.id,
    });

    applicationId = application.id;
  });

  beforeEach(() => {
    createdDomains = [];
  });

  afterEach(async () => {
    await applicationRepository.update(
      { id: applicationId },
      { primaryPublicDomainId: null },
    );

    if (createdDomains.length > 0) {
      await publicDomainRepository.delete({
        workspaceId: workspace.id,
        domain: In(createdDomains),
      });
    }
  });

  afterAll(async () => {
    await applicationRepository.delete({ id: applicationId });
  });

  it('should fall back to the same-site /s URL when no app-bound domain exists', async () => {
    await expect(findFunctionsBaseUrl(applicationId)).resolves.toBe(
      `http://${workspace.subdomain}.localhost:3000/s`,
    );
  });

  it('should serve functions from an app-bound domain once one is validated', async () => {
    const domain = buildTestDomain('single');

    await seedPublicDomain({
      domain,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await expect(findFunctionsBaseUrl(applicationId)).resolves.toBe(
      `https://${domain}`,
    );
  });

  it('should resolve the newest validated app-bound domain when several exist', async () => {
    const olderDomain = buildTestDomain('older');
    const newerAlphaDomain = buildTestDomain('newer-alpha');
    const newerZetaDomain = buildTestDomain('newer-zeta');

    await seedPublicDomain({
      domain: olderDomain,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    await seedPublicDomain({
      domain: newerZetaDomain,
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
    });
    await seedPublicDomain({
      domain: newerAlphaDomain,
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    await expect(findFunctionsBaseUrl(applicationId)).resolves.toBe(
      `https://${newerAlphaDomain}`,
    );
  });

  it('should ignore a newer domain that is not validated yet', async () => {
    const validatedDomain = buildTestDomain('validated');
    const pendingDomain = buildTestDomain('pending');

    await seedPublicDomain({
      domain: validatedDomain,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    await seedPublicDomain({
      domain: pendingDomain,
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
      isValidated: false,
    });

    await expect(findFunctionsBaseUrl(applicationId)).resolves.toBe(
      `https://${validatedDomain}`,
    );
  });

  it('should resolve the primary public domain over a newer domain when one is set', async () => {
    const primaryDomain = buildTestDomain('primary');
    const newerDomain = buildTestDomain('newer');

    const primaryPublicDomain = await seedPublicDomain({
      domain: primaryDomain,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      isValidated: false,
    });

    await seedPublicDomain({
      domain: newerDomain,
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    await applicationRepository.update(
      { id: applicationId },
      { primaryPublicDomainId: primaryPublicDomain.id },
    );

    await expect(findFunctionsBaseUrl(applicationId)).resolves.toBe(
      `https://${primaryDomain}`,
    );
  });

  it('should fall back to the newest remaining domain when the primary is deleted', async () => {
    const primaryDomain = buildTestDomain('primary');
    const olderRemainingDomain = buildTestDomain('remaining-older');
    const newerRemainingDomain = buildTestDomain('remaining-newer');

    const primaryPublicDomain = await seedPublicDomain({
      domain: primaryDomain,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await seedPublicDomain({
      domain: olderRemainingDomain,
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
    });
    await seedPublicDomain({
      domain: newerRemainingDomain,
      createdAt: new Date('2026-01-03T00:00:00.000Z'),
    });

    await applicationRepository.update(
      { id: applicationId },
      { primaryPublicDomainId: primaryPublicDomain.id },
    );

    await publicDomainRepository.delete({ id: primaryPublicDomain.id });

    await expect(
      applicationRepository.findOneByOrFail({ id: applicationId }),
    ).resolves.toMatchObject({ primaryPublicDomainId: null });

    await expect(findFunctionsBaseUrl(applicationId)).resolves.toBe(
      `https://${newerRemainingDomain}`,
    );
  });
});
