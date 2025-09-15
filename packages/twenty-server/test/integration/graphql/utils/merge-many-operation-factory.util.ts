import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared/utils';

type MergeManyOperationFactoryParams = {
  objectMetadataPluralName: string;
  gqlFields: string;
  ids: string[];
  conflictPriorityIndex: number;
  dryRun?: boolean;
};

export const mergeManyOperationFactory = ({
  objectMetadataPluralName,
  gqlFields,
  ids,
  conflictPriorityIndex,
  dryRun = false,
}: MergeManyOperationFactoryParams) => {
  const capitalizedObjectName = capitalize(objectMetadataPluralName);
  const mutationName = `merge${capitalizedObjectName}`;

  return {
    query: gql`
      mutation Merge${capitalizedObjectName}($ids: [UUID!]!, $conflictPriorityIndex: Int!, $dryRun: Boolean! = false) {
        ${mutationName}(ids: $ids, conflictPriorityIndex: $conflictPriorityIndex, dryRun: $dryRun) {
          ${gqlFields}
        }
      }
    `,
    variables: {
      ids,
      conflictPriorityIndex,
      dryRun,
    },
  };
};
