import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { isDefined } from 'twenty-shared/utils';

export const findFieldMetadataIds = async (
  fieldReferences: { objectNameSingular: string; fieldName: string }[],
): Promise<{ objectMetadataId: string; fieldMetadataId: string }[]> => {
  const { objects } = await findManyObjectMetadata({
    input: { filter: {}, paging: { first: 100 } },
    gqlFields: 'id nameSingular fieldsList { id name }',
    expectToFail: false,
  });

  return fieldReferences.map(({ objectNameSingular, fieldName }) => {
    const objectMetadata = objects.find(
      (object) => object.nameSingular === objectNameSingular,
    );
    const fieldMetadata = objectMetadata?.fieldsList?.find(
      (field) => field.name === fieldName,
    );

    if (!isDefined(objectMetadata) || !isDefined(fieldMetadata)) {
      throw new Error(`${objectNameSingular}.${fieldName} not found`);
    }

    return {
      objectMetadataId: objectMetadata.id,
      fieldMetadataId: fieldMetadata.id,
    };
  });
};
