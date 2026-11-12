import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createApiKeyWithFieldPermission } from 'test/integration/permissions/utils/create-api-key-with-field-permission.util';
import { type ApiKeyWithObjectRecordGrants } from 'test/integration/permissions/utils/create-api-key-with-object-record-grants.util';
import { deleteApiKeysWithObjectRecordGrants } from 'test/integration/permissions/utils/delete-api-keys-with-object-record-grants.util';
import { expectFieldPermissionDeniedResponse } from 'test/integration/permissions/utils/expect-field-permission-denied-response.util';

const ATTACHMENT_NAME = 'Shared file';

describe('field permissions on attachment', () => {
  const attachmentId = randomUUID();
  let nameRestricted: ApiKeyWithObjectRecordGrants;
  let createdByRestricted: ApiKeyWithObjectRecordGrants;

  beforeAll(async () => {
    const response = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'attachment',
        gqlFields: 'id',
        data: { id: attachmentId, name: ATTACHMENT_NAME },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    [nameRestricted, createdByRestricted] = await Promise.all([
      createApiKeyWithFieldPermission({
        objectNameSingular: 'attachment',
        fieldName: 'name',
        canUpdateFieldValue: false,
      }),
      createApiKeyWithFieldPermission({
        objectNameSingular: 'attachment',
        fieldName: 'createdBy',
        canUpdateFieldValue: false,
      }),
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      deleteApiKeysWithObjectRecordGrants([
        nameRestricted,
        createdByRestricted,
      ]),
      makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'attachment',
          gqlFields: 'id',
          recordId: attachmentId,
        }),
      ),
    ]);
  });

  it('allows reading the attachment', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'attachment',
        objectMetadataPluralName: 'attachments',
        gqlFields: 'id name',
        filter: { id: { eq: attachmentId } },
      }),
      nameRestricted.token,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.attachments.edges).toEqual([
      { node: { id: attachmentId, name: ATTACHMENT_NAME } },
    ]);
  });

  it('denies renaming the attachment', async () => {
    const response = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'attachment',
        gqlFields: 'id',
        recordId: attachmentId,
        data: { name: 'Renamed' },
      }),
      nameRestricted.token,
    );

    expectFieldPermissionDeniedResponse({
      api: 'graphql',
      response,
      access: 'write',
      objectNameSingular: 'attachment',
      fieldName: 'name',
    });
  });

  it('denies rewriting the attachment author', async () => {
    const response = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'attachment',
        gqlFields: 'id',
        recordId: attachmentId,
        data: { createdBy: { source: 'MANUAL', name: 'Someone else' } },
      }),
      createdByRestricted.token,
    );

    expectFieldPermissionDeniedResponse({
      api: 'graphql',
      response,
      access: 'write',
      objectNameSingular: 'attachment',
      fieldName: 'createdBy',
    });
  });
});
