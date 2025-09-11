import { VIEW_FIELD_FRAGMENT } from '@/mutations/view-field/fragments/view-field-fragment';
import gql from 'graphql-tag';

export const createViewFieldOperationFactory = (gqlFields?: string) => gql`
  ${gqlFields === undefined ? VIEW_FIELD_FRAGMENT : ''}
  mutation CreateCoreViewField($input: CreateViewFieldInput!) {
    createCoreViewField(input: $input) {
      ${gqlFields === undefined ? '...ViewFieldFragment' : gqlFields}
    }
  }
`;
