import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import {
  FeatureFlagKey,
  FieldMetadataType,
  RecordShareAccessLevel,
  RecordShareRowCause,
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

import { type RecordSharePrincipalInput } from 'src/engine/core-modules/record-share/dtos/record-sharing.dto';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OBJECT_NAME = 'openSharingRecord';
const OBJECT_PLURAL = 'openSharingRecords';
const RECORD_ID = randomUUID();
const workspaceId = SEED_APPLE_WORKSPACE_ID;
const JONY = { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY };
const EVERYONE = { everyone: true };
const fields =
  'viewerAccessLevel isEnabled isOpenByDefault generalAccessLevel isGeneralAccessDefault permissions { canRead canUpdate } shares { principalId rowCause accessLevel }';
const READ_SHARING = parse(
  `query RecordSharing($target: RecordSharingTargetInput!) { recordSharing(target: $target) { ${fields} } }`,
);
const SET_SHARE = parse(
  `mutation SetShare($target: RecordSharingTargetInput!, $principal: RecordSharePrincipalInput!, $enabled: Boolean!, $accessLevel: RecordShareAccessLevel) { setRecordShare(target: $target, principal: $principal, enabled: $enabled, accessLevel: $accessLevel) { ${fields} } }`,
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
    enabled,
    accessLevel = RecordShareAccessLevel.READ,
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }: {
    principal: RecordSharePrincipalInput;
    enabled: boolean;
    accessLevel?: RecordShareAccessLevel;
    token?: string;
  }) =>
    makeMetadataApiRequest(
      {
        query: SET_SHARE,
        variables: { target: target(), principal, enabled, accessLevel },
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
      isEnabled: true,
      isOpenByDefault: true,
      generalAccessLevel: RecordShareAccessLevel.READ_WRITE,
      isGeneralAccessDefault: true,
      viewerAccessLevel: RecordShareAccessLevel.FULL,
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

  it('should hide a restricted record from everyone but its creator', async () => {
    const restricted = await setShare({ principal: EVERYONE, enabled: false });

    expect(restricted.body.errors).toBeUndefined();
    expect(restricted.body.data.setRecordShare).toMatchObject({
      generalAccessLevel: RecordShareAccessLevel.NONE,
      isGeneralAccessDefault: false,
      shares: [
        expect.objectContaining({
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          rowCause: RecordShareRowCause.OWNER,
          accessLevel: RecordShareAccessLevel.FULL,
        }),
      ],
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
    await setShare({ principal: EVERYONE, enabled: false });
    await setShare({ principal: JONY, enabled: true });

    expect(await findRecordIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual([
      RECORD_ID,
    ]);
    expect(
      (await rename('Read only', APPLE_JONY_MEMBER_ACCESS_TOKEN)).body.errors,
    ).toBeDefined();

    await setShare({
      principal: JONY,
      enabled: true,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    });

    expect(
      (await rename('Edited by Jony', APPLE_JONY_MEMBER_ACCESS_TOKEN)).body
        .errors,
    ).toBeUndefined();
  });

  it('should let everyone view without editing', async () => {
    const viewOnly = await setShare({
      principal: EVERYONE,
      enabled: true,
      accessLevel: RecordShareAccessLevel.READ,
    });

    expect(viewOnly.body.data.setRecordShare).toMatchObject({
      generalAccessLevel: RecordShareAccessLevel.READ,
      isGeneralAccessDefault: false,
    });
    expect(await findRecordIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual([
      RECORD_ID,
    ]);
    expect(
      (await rename('Not allowed', APPLE_JONY_MEMBER_ACCESS_TOKEN)).body.errors,
    ).toBeDefined();
    expect(
      (await readSharing(APPLE_JONY_MEMBER_ACCESS_TOKEN)).body.data
        .recordSharing,
    ).toMatchObject({
      viewerAccessLevel: RecordShareAccessLevel.READ,
      permissions: { canRead: true, canUpdate: false },
    });
  });

  it('should drop the exception row when general access returns to the default', async () => {
    await setShare({ principal: EVERYONE, enabled: false });
    const reopened = await setShare({
      principal: EVERYONE,
      enabled: true,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    });

    expect(reopened.body.data.setRecordShare).toMatchObject({
      generalAccessLevel: RecordShareAccessLevel.READ_WRITE,
      isGeneralAccessDefault: true,
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
    const response = await setShare({
      principal: EVERYONE,
      enabled: false,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeDefined();
    expect(await findRecordIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual([
      RECORD_ID,
    ]);
    expect(
      (await readSharing(APPLE_JONY_MEMBER_ACCESS_TOKEN)).body.data
        .recordSharing,
    ).toMatchObject({
      viewerAccessLevel: RecordShareAccessLevel.READ_WRITE,
      shares: [],
    });
  });

  it('should refuse NONE as a granted access level', async () => {
    const response = await setShare({
      principal: JONY,
      enabled: true,
      accessLevel: RecordShareAccessLevel.NONE,
    });

    expect(response.body.errors).toBeDefined();
  });

  it('should leave open objects untouched while the flag is off', async () => {
    await setShare({ principal: EVERYONE, enabled: false });
    await setRecordSharingEnabled(false);

    try {
      expect(await findRecordIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual([
        RECORD_ID,
      ]);
      expect((await readSharing()).body.data.recordSharing.isEnabled).toBe(
        false,
      );
      expect(
        (await setShare({ principal: EVERYONE, enabled: false })).body.errors,
      ).toBeDefined();
    } finally {
      await setRecordSharingEnabled(true);
    }
  });
});
