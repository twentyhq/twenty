import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';

type TestContext = {
  input: AllMetadataName;
};

const testCases: EachTestingContext<TestContext>[] = (
  Object.keys(ALL_METADATA_NAME) as (keyof typeof ALL_METADATA_NAME)[]
).map((metadataName) => ({
  title: `should return related metadata names for ${metadataName}`,
  context: {
    input: metadataName,
  },
}));

describe('getMetadataRelatedMetadataNames', () => {
  test.each(eachTestingContextFilter(testCases))(
    '$title',
    ({ context: { input } }) => {
      const result = getMetadataRelatedMetadataNames(input);

      expect(result).toMatchSnapshot();
    },
  );
});
