import gql from 'graphql-tag';

type DestroyPageLayoutOperationFactoryParams = {
  pageLayoutId: string;
};

export const destroyPageLayoutOperationFactory = ({
  pageLayoutId,
}: DestroyPageLayoutOperationFactoryParams) => ({
  query: gql`
    mutation DestroyPageLayout($id: String!) {
      destroyPageLayout(id: $id)
    }
  `,
  variables: {
    id: pageLayoutId,
  },
});
