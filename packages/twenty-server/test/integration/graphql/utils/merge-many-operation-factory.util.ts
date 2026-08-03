import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared/utils';

type MergeManyOperationFactoryParams = {
  objectMetadataSingularName?: string;
  objectMetadataPluralName: string;
  gqlFields: string;
  ids: string[];
  conflictPriorityIndex: number;
  dryRun?: boolean;
  data?: Record<string, unknown>;
};

export const mergeManyOperationFactory = ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  gqlFields,
  ids,
  conflictPriorityIndex,
  dryRun = false,
  data,
}: MergeManyOperationFactoryParams) => {
  const capitalizedObjectName = capitalize(objectMetadataPluralName);
  const mutationName = `merge${capitalizedObjectName}`;
  const dataVariableDeclaration = objectMetadataSingularName
    ? `, $data: ${capitalize(objectMetadataSingularName)}UpdateInput`
    : '';
  const dataArgument = objectMetadataSingularName ? ', data: $data' : '';

  return {
    query: gql`
      mutation Merge${capitalizedObjectName}($ids: [UUID!]!, $conflictPriorityIndex: Int!, $dryRun: Boolean! = false${dataVariableDeclaration}) {
        ${mutationName}(ids: $ids, conflictPriorityIndex: $conflictPriorityIndex, dryRun: $dryRun${dataArgument}) {
          ${gqlFields}
        }
      }
    `,
    variables: {
      ids,
      conflictPriorityIndex,
      dryRun,
      ...(objectMetadataSingularName ? { data } : {}),
    },
  };
};
