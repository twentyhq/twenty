import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';

export const createAccessTestObject = async ({
  nameSingular,
}: {
  nameSingular: string;
}): Promise<string> => {
  const { data } = await createOneObjectMetadata({
    expectToFail: false,
    input: {
      nameSingular,
      namePlural: `${nameSingular}s`,
      labelSingular: nameSingular,
      labelPlural: `${nameSingular}s`,
      icon: 'IconUsers',
      isLabelSyncedWithName: false,
    },
  });

  return data.createOneObject.id;
};
