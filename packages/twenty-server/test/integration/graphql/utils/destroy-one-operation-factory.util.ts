import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared/utils';

type DestroyOneOperationFactoryParams = {
  objectMetadataSingularName: string;
  gqlFields: string;
  recordId: string;
};

export const destroyOneOperationFactory = ({
  objectMetadataSingularName,
  gqlFields,
  recordId,
}: DestroyOneOperationFactoryParams) => ({
  query: gql`
    mutation Destroy${capitalize(objectMetadataSingularName)}($${objectMetadataSingularName}Id: UUID!) {
      destroy${capitalize(objectMetadataSingularName)}(id: $${objectMetadataSingularName}Id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    [`${objectMetadataSingularName}Id`]: recordId,
  },
});
