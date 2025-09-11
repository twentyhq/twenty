import gql from 'graphql-tag';

export const destroyViewFieldOperationFactory = ({
  viewFieldId,
}: {
  viewFieldId: string;
}) => ({
  query: gql`
    mutation DestroyCoreViewField($input: DestroyViewFieldInput!) {
      destroyCoreViewField(input: $input)
    }
  `,
  variables: {
    input: { id: viewFieldId },
  },
});
