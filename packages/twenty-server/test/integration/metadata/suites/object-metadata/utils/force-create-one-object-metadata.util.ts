import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { CreateOneObjectFactoryInput } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { isDefined } from 'twenty-shared/utils';

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
  const { objects, errors } = await findManyObjectMetadata({
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

  if (isDefined(errors) || !isDefined(objects)) {
    throw new Error(
      'Force create object metadata find many failed, should never occur',
    );
  }

  const match = objects.find((object) => object.nameSingular === nameSingular);

  if (!isDefined(match)) {
    throw new Error(
      `Could not find an object with nameSingular ${nameSingular}, high chances this is a race condition`,
    );
  }

  const { errors: deleteErrors } = await deleteOneObjectMetadata({
    input: { idToDelete: match.id },
  });

  if (isDefined(deleteErrors)) {
    throw new Error(JSON.stringify(deleteErrors));
  }

  return await createOneObjectMetadata({
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
};
