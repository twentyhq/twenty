import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import {
  type FieldMetadataComplexOption,
  type RelationCreationPayload,
} from 'twenty-shared/types';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

export type MalformedFieldOptionInput = Omit<
  FieldMetadataComplexOption,
  'label' | 'value'
> &
  Partial<Pick<FieldMetadataComplexOption, 'label' | 'value'>>;

type MalformedRelationCreationPayloadInput = Omit<
  RelationCreationPayload,
  'type'
> &
  Partial<Pick<RelationCreationPayload, 'type'>>;

export type CreateOneFieldFactoryInput = Omit<
  CreateFieldInput,
  'workspaceId' | 'dataSourceId' | 'options' | 'morphRelationsCreationPayload'
> & {
  options?: CreateFieldInput['options'] | MalformedFieldOptionInput[];
  morphRelationsCreationPayload?: MalformedRelationCreationPayloadInput[];
};

export const createOneFieldMetadataQueryFactory = ({
  input,
  gqlFields = 'id',
}: PerformMetadataQueryParams<CreateOneFieldFactoryInput>) => ({
  query: gql`
        mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {
          createOneField(input: $input) {
            ${gqlFields}
        }
      }
      `,
  variables: {
    input: { field: input },
  },
});
