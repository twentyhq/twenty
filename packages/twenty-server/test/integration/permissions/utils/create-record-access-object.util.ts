import { createOneFieldMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { waitForDeferredWorkspaceMigrationActionsOrThrow } from 'test/integration/utils/wait-for-deferred-workspace-migration-actions-or-throw.util';
import { FieldMetadataType } from 'twenty-shared/types';

const createFilterField = async ({
  name,
  objectMetadataId,
  accessToken,
}: {
  name: string;
  objectMetadataId: string;
  accessToken: string;
}) => {
  await waitForDeferredWorkspaceMigrationActionsOrThrow();

  const response = await makeMetadataApiRequest(
    createOneFieldMetadataQueryFactory({
      input: {
        name,
        label: name,
        type: FieldMetadataType.TEXT,
        objectMetadataId,
      },
      gqlFields: 'id universalIdentifier',
    }),
    accessToken,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.createOneField as {
    id: string;
    universalIdentifier: string;
  };
};

export const createRecordAccessObject = async ({
  nameSingular,
  namePlural,
  accessToken,
}: {
  nameSingular: string;
  namePlural: string;
  accessToken: string;
}) => {
  const { data } = await createOneObjectMetadata({
    input: {
      nameSingular,
      namePlural,
      labelSingular: nameSingular,
      labelPlural: namePlural,
      icon: 'IconLock',
    },
    gqlFields: 'id universalIdentifier',
    expectToFail: false,
    token: accessToken,
  });
  const objectMetadataId = data.createOneObject.id;
  const status = await createFilterField({
    name: 'status',
    objectMetadataId,
    accessToken,
  });
  const category = await createFilterField({
    name: 'category',
    objectMetadataId,
    accessToken,
  });
  const region = await createFilterField({
    name: 'region',
    objectMetadataId,
    accessToken,
  });

  return {
    objectMetadataId,
    objectUniversalIdentifier: data.createOneObject
      .universalIdentifier as string,
    fields: { status, category, region },
  };
};
