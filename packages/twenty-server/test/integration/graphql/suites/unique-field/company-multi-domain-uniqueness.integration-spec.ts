import { randomUUID } from 'crypto';

import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { updateOneOperation } from 'test/integration/graphql/utils/update-one-operation.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';

const COMPANY_GQL_FIELDS = `
  id
  name
  domainName {
    primaryLinkUrl
    primaryLinkLabel
    secondaryLinks
  }
`;

describe('company multi-domain uniqueness', () => {
  const createdCompanyIds: string[] = [];

  afterAll(async () => {
    if (createdCompanyIds.length > 0) {
      await deleteRecordsByIds('company', createdCompanyIds);
    }
  });

  it('rejects creating a company whose primary URL collides with a secondary URL of an existing company', async () => {
    const firstId = randomUUID();
    const secondId = randomUUID();
    const sharedDomain = `shared-${randomUUID().slice(0, 8)}.com`;

    const first = await createOneOperation({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      input: {
        id: firstId,
        name: 'Acme Primary',
        domainName: {
          primaryLinkUrl: 'https://primary.com',
          secondaryLinks: [
            { label: 'Alt', url: `https://${sharedDomain}` },
          ],
        },
      },
    });

    expect(first.errors).toBeUndefined();
    expect(first.data.createOneResponse.id).toBe(firstId);
    createdCompanyIds.push(firstId);

    const second = await createOneOperation({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      expectToFail: true,
      input: {
        id: secondId,
        name: 'Acme Duplicate',
        domainName: {
          primaryLinkUrl: `https://${sharedDomain}`,
        },
      },
    });

    expect(second.errors).toBeDefined();
    expect(second.errors?.[0]?.message ?? '').toMatch(/already.*linked|duplicate/i);
  });

  it('rejects adding a secondary URL that already exists as another company primary URL', async () => {
    const firstId = randomUUID();
    const secondId = randomUUID();
    const collidingDomain = `collide-${randomUUID().slice(0, 8)}.com`;

    const first = await createOneOperation({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      input: {
        id: firstId,
        name: 'Existing primary owner',
        domainName: { primaryLinkUrl: `https://${collidingDomain}` },
      },
    });

    expect(first.errors).toBeUndefined();
    createdCompanyIds.push(firstId);

    const second = await createOneOperation({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      input: {
        id: secondId,
        name: 'Tries to claim same domain as a secondary',
        domainName: {
          primaryLinkUrl: 'https://other-primary.com',
        },
      },
    });

    expect(second.errors).toBeUndefined();
    createdCompanyIds.push(secondId);

    const update = await updateOneOperation({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      recordId: secondId,
      expectToFail: true,
      input: {
        domainName: {
          primaryLinkUrl: 'https://other-primary.com',
          secondaryLinks: [
            { label: 'Alt', url: `https://${collidingDomain}` },
          ],
        },
      },
    });

    expect(update.errors).toBeDefined();
    expect(update.errors?.[0]?.message ?? '').toMatch(/already.*linked|duplicate/i);
  });

  it('accepts adding multiple secondary URLs to a single company', async () => {
    const id = randomUUID();
    const baseDomain = `multi-${randomUUID().slice(0, 8)}`;

    const create = await createOneOperation({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      input: {
        id,
        name: 'Has multiple domains',
        domainName: {
          primaryLinkUrl: `https://${baseDomain}.com`,
          secondaryLinks: [
            { label: 'EU', url: `https://${baseDomain}.eu` },
            { label: 'UK', url: `https://${baseDomain}.co.uk` },
          ],
        },
      },
    });

    expect(create.errors).toBeUndefined();
    expect(create.data.createOneResponse.id).toBe(id);
    expect(
      create.data.createOneResponse.domainName.secondaryLinks,
    ).toHaveLength(2);
    createdCompanyIds.push(id);
  });

  it('rejects a payload that lists the same secondary URL twice', async () => {
    const id = randomUUID();
    const dup = `selfdup-${randomUUID().slice(0, 8)}.com`;

    const create = await createOneOperation({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      expectToFail: true,
      input: {
        id,
        name: 'Self-duplicate payload',
        domainName: {
          primaryLinkUrl: 'https://primary-selfdup.com',
          secondaryLinks: [
            { label: 'A', url: `https://${dup}` },
            { label: 'B', url: `https://${dup}` },
          ],
        },
      },
    });

    expect(create.errors).toBeDefined();
    expect(create.errors?.[0]?.message ?? '').toMatch(/listed.*more.*than.*once|duplicate/i);
  });

  it('treats different cases and trailing slashes as the same domain', async () => {
    const firstId = randomUUID();
    const secondId = randomUUID();
    const baseDomain = `case-${randomUUID().slice(0, 8)}.com`;

    const first = await createOneOperation({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      input: {
        id: firstId,
        name: 'Lowercase owner',
        domainName: { primaryLinkUrl: `https://${baseDomain}` },
      },
    });

    expect(first.errors).toBeUndefined();
    createdCompanyIds.push(firstId);

    const second = await createOneOperation({
      objectMetadataSingularName: 'company',
      gqlFields: COMPANY_GQL_FIELDS,
      expectToFail: true,
      input: {
        id: secondId,
        name: 'Mixed-case duplicate',
        domainName: {
          primaryLinkUrl: `HTTPS://www.${baseDomain.toUpperCase()}/`,
        },
      },
    });

    expect(second.errors).toBeDefined();
  });
});
