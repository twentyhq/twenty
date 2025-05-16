import gql from 'graphql-tag';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type CreateOneViewFilterFactoryInput = {
  displayValue?: string;
  fieldMetadataId: string;
  id?: string;
  operand?: string;
  value?: string;
  viewId?: string;
  viewFilterGroupId?: string;
  positionInViewFilterGroup?: number;
  subFieldName?: string;
};

export const createOneViewFilterQueryFactory = ({
  input,
  gqlFields = 'id',
}: PerformMetadataQueryParams<CreateOneViewFilterFactoryInput>) => ({
  query: gql`
        mutation CreateOneViewFilter($input: ViewFilterCreateInput!) {
          createViewFilter(data: $input) {
            ${gqlFields}
        }
      }
      `,
  variables: {
    input,
  },
}); 