import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { type CreateOneObjectFactoryInput } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { isDefined } from 'twenty-shared/utils';

/**
 * This testing function util should be use for local debugging only
 * Please do not call this method in prod ci
 * Each test should handle and adopt black box testing pattern
 */
export const forceCreateOneObjectMetadata = async ({
  input: {
    labelSingular = LISTING_NAME_SINGULAR,
    labelPlural = LISTING_NAME_PLURAL,
    nameSingular = LISTING_NAME_SINGULAR,
    namePlural = LISTING_NAME_PLURAL,
    isLabelSyncedWithName = true,
    icon = 'IconBuildingSkyscraper',
    ...rest
  },
}: {
  input: Partial<CreateOneObjectFactoryInput>;
}) => {
  const result = await createOneObjectMetadata({
    input: {
      labelSingular,
      labelPlural,
      nameSingular,
      namePlural,
      icon,
      isLabelSyncedWithName,
      ...rest,
    },
  });

  if (!isDefined(result.errors)) {
    return result;
  }

  const { objects } = await findManyObjectMetadata({
    expectToFail: false,
    input: {
      filter: {},
      paging: {
        first: 10000,
      },
    },
    gqlFields: `
    nameSingular,
    id
    `,
  });

  const match = objects.find((object) => object.nameSingular === nameSingular);

  if (!isDefined(match)) {
    throw new Error(
      `Could not find an object with nameSingular ${nameSingular}, high chances this is a race condition`,
    );
  }

  await updateOneObjectMetadata({
    expectToFail: false,
    input: { idToUpdate: match.id, updatePayload: { isActive: false } },
  });

  await deleteOneObjectMetadata({
    expectToFail: false,
    input: { idToDelete: match.id },
  });

  const { errors: createErrors, data } = await createOneObjectMetadata({
    expectToFail: false,
    input: {
      labelSingular,
      labelPlural,
      nameSingular,
      namePlural,
      icon,
      isLabelSyncedWithName,
      ...rest,
    },
  });

  return {
    data,
    errors: createErrors,
  };
};
