import gql from 'graphql-tag';

type DeletePageLayoutTabOperationFactoryParams = {
  pageLayoutTabId: string;
};

export const deletePageLayoutTabOperationFactory = ({
  pageLayoutTabId,
}: DeletePageLayoutTabOperationFactoryParams) => ({
  query: gql`
    mutation DeletePageLayoutTab($id: String!) {
      deletePageLayoutTab(id: $id)
    }
  `,
  variables: {
    id: pageLayoutTabId,
  },
});
