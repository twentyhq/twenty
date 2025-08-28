import gql from 'graphql-tag';

type DeletePageLayoutOperationFactoryParams = {
  pageLayoutId: string;
};

export const deletePageLayoutOperationFactory = ({
  pageLayoutId,
}: DeletePageLayoutOperationFactoryParams) => ({
  query: gql`
    mutation DeletePageLayout($id: String!) {
      deletePageLayout(id: $id)
    }
  `,
  variables: {
    id: pageLayoutId,
  },
});
