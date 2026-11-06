import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { parse } from 'graphql';

import { type RecordSharePrincipalInput } from 'src/engine/permissions/record-share/dtos/record-sharing.dto';

const SET_RECORD_SHARE = parse(
  `mutation SetShare($target: RecordTargetInput!, $principal: RecordSharePrincipalInput!, $accessLevel: RecordShareAccessLevel!) { setRecordShare(target: $target, principal: $principal, accessLevel: $accessLevel) { canManageSharing } }`,
);
const SET_RECORD_PRIVATE = parse(
  `mutation SetPrivate($target: RecordTargetInput!, $isPrivate: Boolean!) { setRecordPrivate(target: $target, isPrivate: $isPrivate) { canManageSharing } }`,
);

export type RecordAccessRecordFixture = {
  status?: string;
  category?: string;
  region?: string;
  isPrivate?: boolean;
  share?: {
    principal: RecordSharePrincipalInput;
    accessLevel: RecordShareAccessLevel;
  };
};

export const createRecordAccessRecord = async ({
  objectNameSingular,
  objectMetadataId,
  fixture: {
    status = 'active',
    category = 'core',
    region = 'europe',
    isPrivate = false,
    share,
  },
  accessToken,
}: {
  objectNameSingular: string;
  objectMetadataId: string;
  fixture: RecordAccessRecordFixture;
  accessToken: string;
}) => {
  const response = await makeGraphqlApiRequest(
    createOneOperationFactory({
      objectMetadataSingularName: objectNameSingular,
      gqlFields: 'id',
      data: { status, category, region },
    }),
    accessToken,
  );

  expect(response.body.errors).toBeUndefined();

  const recordId: string =
    response.body.data[`create${capitalize(objectNameSingular)}`].id;
  const target = { objectMetadataId, recordId };

  if (isDefined(share)) {
    const shareResponse = await makeMetadataApiRequest(
      {
        query: SET_RECORD_SHARE,
        variables: { target, ...share },
      },
      accessToken,
    );

    expect(shareResponse.body.errors).toBeUndefined();
  }

  if (isPrivate) {
    const privateResponse = await makeMetadataApiRequest(
      {
        query: SET_RECORD_PRIVATE,
        variables: { target, isPrivate },
      },
      accessToken,
    );

    expect(privateResponse.body.errors).toBeUndefined();
  }

  return recordId;
};
