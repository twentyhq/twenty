import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { isDefined } from 'twenty-shared/utils';

export type UpdateOneApplicationVariableFactoryInput = {
  key: string;
  value: string;
  applicationId?: string;
};

// The argument is left out of the document when the caller does not name an
// application, so the request exercises the inferred target rather than an
// explicit null.
export const updateOneApplicationVariableQueryFactory = ({
  input,
}: PerformMetadataQueryParams<UpdateOneApplicationVariableFactoryInput>) =>
  isDefined(input.applicationId)
    ? {
        query: gql`
          mutation UpdateOneApplicationVariable(
            $key: String!
            $value: String!
            $applicationId: UUID!
          ) {
            updateOneApplicationVariable(
              key: $key
              value: $value
              applicationId: $applicationId
            )
          }
        `,
        variables: {
          key: input.key,
          value: input.value,
          applicationId: input.applicationId,
        },
      }
    : {
        query: gql`
          mutation UpdateOneApplicationVariable(
            $key: String!
            $value: String!
          ) {
            updateOneApplicationVariable(key: $key, value: $value)
          }
        `,
        variables: {
          key: input.key,
          value: input.value,
        },
      };
