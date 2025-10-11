import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';

import { FLAT_SERVERLESS_FUNCTION_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/serverless-function/constants/flat-serverless-function-properties-to-compare.constant';
import { type FlatServerlessFunctionPropertiesToCompare } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function-properties-to-compare.type';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { type UpdateServerlessFunctionAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-serverless-function-action-v2.type';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

type GetWorkspaceMigrationUpdateServerlessFunctionActionArgs = FromTo<
  FlatServerlessFunction,
  'FlatServerlessFunction'
>;

export const compareTwoFlatServerlessFunction = ({
  fromFlatServerlessFunction,
  toFlatServerlessFunction,
}: GetWorkspaceMigrationUpdateServerlessFunctionActionArgs) => {
  const transformMetadataForComparisonParameters = {
    shouldIgnoreProperty: (property: string) =>
      !FLAT_SERVERLESS_FUNCTION_PROPERTIES_TO_COMPARE.includes(
        property as FlatServerlessFunctionPropertiesToCompare,
      ),
    propertiesToStringify: [],
  };
  const fromCompare = transformMetadataForComparison(
    fromFlatServerlessFunction,
    transformMetadataForComparisonParameters,
  );
  const toCompare = transformMetadataForComparison(
    toFlatServerlessFunction,
    transformMetadataForComparisonParameters,
  );

  const flatServerlessFunctionDifferences = diff(fromCompare, toCompare);

  return flatServerlessFunctionDifferences.flatMap<
    UpdateServerlessFunctionAction['updates'][number]
  >((difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        const { oldValue, path, value } = difference;
        const property = path[0] as FlatServerlessFunctionPropertiesToCompare;

        return {
          from: oldValue,
          to: value,
          property,
        };
      }
      case 'CREATE':
      case 'REMOVE':
      default: {
        // Should never occurs, we should only provide null never undefined and so on
        return [];
      }
    }
  });
};
