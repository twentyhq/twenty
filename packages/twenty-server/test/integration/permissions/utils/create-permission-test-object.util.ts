import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
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
  const { data } = await createOneFieldMetadata({
    input: {
      name,
      label: name,
      type: FieldMetadataType.TEXT,
      objectMetadataId,
    },
    gqlFields: 'id universalIdentifier',
    expectToFail: false,
    token: accessToken,
  });

  return data.createOneField;
};

export const createPermissionTestObject = async ({
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
    objectUniversalIdentifier: data.createOneObject.universalIdentifier,
    fields: { status, category, region },
  };
};
