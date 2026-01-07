import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateRouteTriggerInput } from 'src/engine/metadata-modules/route-trigger/dtos/create-route-trigger.input';

export type CreateOneRouteTriggerFactoryInput = CreateRouteTriggerInput;

const DEFAULT_ROUTE_TRIGGER_GQL_FIELDS = `
  id
  path
  isAuthRequired
  httpMethod
`;

export const createOneRouteTriggerQueryFactory = ({
  input,
  gqlFields = DEFAULT_ROUTE_TRIGGER_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateOneRouteTriggerFactoryInput>) => ({
  query: gql`
    mutation CreateOneRouteTrigger($input: CreateRouteTriggerInput!) {
      createOneRouteTrigger(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
