import gql from 'graphql-tag';

type ObjectsFactoryParams = {
  gqlFields: string;
  input: {
    filter: object;
    paging: object;
  };
};

export const objectsMetadataFactory = ({
  gqlFields,
  input,
}: ObjectsFactoryParams) => ({
  query: gql`
      query ObjectsMetadata($filter: objectFilter!, $paging: CursorPaging!) {
        objects(filter: $filter, paging: $paging) {
          edges {
            node {
               ${gqlFields}
            }
          }
        }
      }
    `,
  variables: {
    filter: input.filter,
    paging: input.paging,
  },
});
