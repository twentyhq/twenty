
import { VIEW_FIELD_FRAGMENT } from './fragments/view-field-fragment';

export const createViewFieldOperationFactory = (fields?: string): string => {
  return `
    mutation CreateCoreViewField($input: CreateViewFieldInput!) {
      createCoreViewField(input: $input) {
        ${fields || '...ViewFieldFragment'}
      }
    }
    ${!fields ? VIEW_FIELD_FRAGMENT : ''}
  `;
};