import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import {
  FeatureFlagKey,
  FieldMetadataType,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type RecordSharePrincipalInput } from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import { type RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OBJECT_NAME = 'openSharingRecord';
const OBJECT_PLURAL = 'openSharingRecords';
const RECORD_ID = randomUUID();
const workspaceId = SEED_APPLE_WORKSPACE_ID;
const JONY = { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY };
const fields =
  'isShareable isPrivate canManageSharing permissions { canRead canUpdate } shares { principalId rowCause accessLevel }';
const READ_SHARING = parse(
  `query RecordSharing($target: RecordTargetInput!) { recordSharing(target: $target) { ${fields} } }`,
);
const SET_SHARE = parse(
  `mutation SetShare($target: RecordTargetInput!, $principal: RecordSharePrincipalInput!, $accessLevel: RecordShareAccessLevel!) { setRecordShare(target: $target, principal: $principal, accessLevel: $accessLevel) { ${fields} } }`,
);
const REMOVE_SHARE = parse(
  `mutation RemoveShare($target: RecordTargetInput!, $principal: RecordSharePrincipalInput!) { removeRecordShare(target: $target, principal: $principal) { ${fields} } }`,
);
const SET_PRIVATE = parse(
  `mutation SetPrivate($target: RecordTargetInput!, $isPrivate: Boolean!) { setRecordPrivate(target: $target, isPrivate: $isPrivate) { ${fields} } }`,
);

describe('Record-level sharing on an object open by default', () => {
  let objectMetadataId: string;
  let shares: RecordShareStorageService;
  const target = () => ({ objectMetadataId, recordId: RECORD_ID });

  const setRecordSharingEnabled = (value: boolean) =>
    updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value,
      expectToFail: false,
    });

  const readSharing = (token = APPLE_JANE_ADMIN_ACCESS_TOKEN) =>
    makeMetadataApiRequest(
      { query: READ_SHARING, variables: { target: target() } },
      token,
    );

  const setShare = ({
    principal,
    accessLevel = RecordShareAccessLevel.READ,
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }: {
    principal: RecordSharePrincipalInput;
    accessLevel?: RecordShareAccessLevel;
    token?: string;
  }) =>
    makeMetadataApiRequest(
      {
        query: SET_SHARE,
        variables: { target: target(), principal, accessLevel },
      },
      token,
    );

  const setPrivate = (
    isPrivate: boolean,
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  ) =>
    makeMetadataApiRequest(
      {
        query: SET_PRIVATE,
        variables: { target: target(), isPrivate },
      },
      token,
    );

  const findRecordIds = async (token: string) => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id',
        filter: { id: { eq: RECORD_ID } },
      }),
      token,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data[OBJECT_PLURAL].edges.map(
      ({ node }: { node: { id: string } }) => node.id,
    );
  };

  const rename = (name: string, token: string) =>
    makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        gqlFields: 'id name',
        recordId: RECORD_ID,
        data: { name },
      }),
      token,
    );

  beforeAll(async () => {
    shares = getAppProviderByClassName<RecordShareStorageService>(
      'RecordShareStorageService',
    );
    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_NAME,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'Open sharing record',
        labelPlural: 'Open sharing records',
        icon: 'IconShare',
        isLabelSyncedWithName: false,
      },
    });

    objectMetadataId = data.createOneObject.id;
    await createOneFieldMetadata({
      input: {
        name: 'name',
        label: 'Name',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
        isLabelSyncedWithName: false,
      },
    });

    const created = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        gqlFields: 'id',
        data: { id: RECORD_ID, name: 'Created by Jane' },
      }),
    );

    expect(created.body.errors).toBeUndefined();
    await setRecordSharingEnabled(true);
  });

  beforeEach(async () => {
    await setPrivate(false);
    await shares.deleteByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds: [RECORD_ID],
    });
  });

  afterAll(async () => {
    await setRecordSharingEnabled(false);
    await shares.deleteByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds: [RECORD_ID],
    });
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id',
        filter: { id: { eq: RECORD_ID } },
      }),
    );
    await updateOneObjectMetadata({
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
      expectToFail: false,
    });
    await deleteOneObjectMetadata({ input: { idToDelete: objectMetadataId } });
  });

  it('should write no share row for a record that follows the default', async () => {
    const response = await readSharing();

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.recordSharing).toMatchObject({
      isShareable: true,
      canManageSharing: true,
      isPrivate: false,
      shares: [],
    });
    expect(
      await shares.findByRecordIds({
        workspaceId,
        objectMetadataId,
        recordIds: [RECORD_ID],
      }),
    ).toEqual([]);
    expect(await findRecordIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual([
      RECORD_ID,
    ]);
  });

  it('should hide a private record from everyone but its creator, with no share row for the creator', async () => {
    const restricted = await setPrivate(true);

    expect(restricted.body.errors).toBeUndefined();
    expect(restricted.body.data.setRecordPrivate).toMatchObject({
      isPrivate: true,
      shares: [],
    });
    expect(await findRecordIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual([]);
    expect(await findRecordIds(APPLE_JANE_ADMIN_ACCESS_TOKEN)).toEqual([
      RECORD_ID,
    ]);
    expect(
      (await readSharing(APPLE_JONY_MEMBER_ACCESS_TOKEN)).body.errors,
    ).toBeDefined();
  });

  it('should let a grant lift a restriction up to its level', async () => {
    await setPrivate(true);
    await setShare({ principal: JONY });

    expect(await findRecordIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual([
      RECORD_ID,
    ]);
    expect(
      (await rename('Read only', APPLE_JONY_MEMBER_ACCESS_TOKEN)).body.errors,
    ).toBeDefined();

    await setShare({
      principal: JONY,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    });

    expect(
      (await rename('Edited by Jony', APPLE_JONY_MEMBER_ACCESS_TOKEN)).body
        .errors,
    ).toBeUndefined();
  });

  it('should let a private record follow its roles again', async () => {
    await setPrivate(true);
    const reopened = await setPrivate(false);

    expect(reopened.body.data.setRecordPrivate).toMatchObject({
      isPrivate: false,
    });
    expect(
      await shares.findByRecordIds({
        workspaceId,
        objectMetadataId,
        recordIds: [RECORD_ID],
      }),
    ).toEqual([]);
    expect(
      (await rename('Open again', APPLE_JONY_MEMBER_ACCESS_TOKEN)).body.errors,
    ).toBeUndefined();
  });

  it('should keep sharing in the hands of the creator and full access holders', async () => {
    const response = await setPrivate(true, APPLE_JONY_MEMBER_ACCESS_TOKEN);

    expect(response.body.errors).toBeDefined();
    expect(await findRecordIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual([
      RECORD_ID,
    ]);
    expect(
      (await readSharing(APPLE_JONY_MEMBER_ACCESS_TOKEN)).body.data
        .recordSharing,
    ).toMatchObject({
      canManageSharing: false,
      shares: [],
    });
  });

  it('should keep a full access holder who restricts the record in charge of it', async () => {
    await setShare({
      principal: JONY,
      accessLevel: RecordShareAccessLevel.FULL,
    });

    const restricted = await setPrivate(true, APPLE_JONY_MEMBER_ACCESS_TOKEN);

    expect(restricted.body.errors).toBeUndefined();

    const unshared = await makeMetadataApiRequest({
      query: REMOVE_SHARE,
      variables: { target: target(), principal: JONY },
    });

    expect(unshared.body.errors).toBeUndefined();
    expect(await findRecordIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual([
      RECORD_ID,
    ]);
    expect(
      (await readSharing(APPLE_JONY_MEMBER_ACCESS_TOKEN)).body.data
        .recordSharing.canManageSharing,
    ).toBe(true);
  });

  it('should refuse NONE as a granted access level', async () => {
    const response = await setShare({
      principal: JONY,
      accessLevel: RecordShareAccessLevel.NONE,
    });

    expect(response.body.errors).toBeDefined();
  });

  it('should refuse a principal naming both a member and a role', async () => {
    const response = await setShare({
      principal: { ...JONY, roleId: randomUUID() },
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('should keep a record private when a grant is removed', async () => {
    await setPrivate(true);
    await setShare({ principal: JONY });

    const removed = await makeMetadataApiRequest({
      query: REMOVE_SHARE,
      variables: { target: target(), principal: JONY },
    });

    expect(removed.body.errors).toBeUndefined();
    expect(removed.body.data.removeRecordShare).toMatchObject({
      isPrivate: true,
      shares: [],
    });
    expect(await findRecordIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual([]);
  });

  it('should leave open objects untouched while the flag is off', async () => {
    await setPrivate(true);
    await setRecordSharingEnabled(false);

    try {
      expect(await findRecordIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual([
        RECORD_ID,
      ]);
      expect((await readSharing()).body.data.recordSharing).toMatchObject({
        isShareable: false,
        canManageSharing: false,
        isPrivate: false,
      });
      expect((await setPrivate(true)).body.errors).toBeDefined();
    } finally {
      await setRecordSharingEnabled(true);
    }
  });
});
