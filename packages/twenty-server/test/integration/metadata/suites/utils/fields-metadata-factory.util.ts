import gql from 'graphql-tag';

type FieldsFactoryParams = {
  gqlFields: string;
  input: {
    filter: object;
    paging: object;
  };
};

export const fieldsMetadataFactory = ({
  gqlFields,
  input,
}: FieldsFactoryParams) => ({
  query: gql`
      query FieldsMetadata($filter: fieldFilter!, $paging: CursorPaging!) {
        fields(filter: $filter, paging: $paging) {
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
