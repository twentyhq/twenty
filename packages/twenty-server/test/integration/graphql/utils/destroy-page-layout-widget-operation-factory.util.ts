import gql from 'graphql-tag';

type DestroyPageLayoutWidgetOperationFactoryParams = {
  pageLayoutWidgetId: string;
};

export const destroyPageLayoutWidgetOperationFactory = ({
  pageLayoutWidgetId,
}: DestroyPageLayoutWidgetOperationFactoryParams) => ({
  query: gql`
    mutation DestroyPageLayoutWidget($id: String!) {
      destroyPageLayoutWidget(id: $id)
    }
  `,
  variables: {
    id: pageLayoutWidgetId,
  },
});
