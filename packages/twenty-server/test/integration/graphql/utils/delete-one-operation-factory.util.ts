import { capitalize } from '@twenty/shared';
import gql from 'graphql-tag';

type DeleteOneOperationFactoryParams = {
  objectMetadataSingularName: string;
  gqlFields: string;
  recordId: string;
};

export const deleteOneOperationFactory = ({
  objectMetadataSingularName,
  gqlFields,
  recordId,
}: DeleteOneOperationFactoryParams) => ({
  query: gql`
    mutation Delete${capitalize(objectMetadataSingularName)}($${objectMetadataSingularName}Id: ID!) {
      delete${capitalize(objectMetadataSingularName)}(id: $${objectMetadataSingularName}Id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    [`${objectMetadataSingularName}Id`]: recordId,
  },
});
