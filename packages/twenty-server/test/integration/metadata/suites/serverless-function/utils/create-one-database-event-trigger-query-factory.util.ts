import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateDatabaseEventTriggerInput } from 'src/engine/metadata-modules/database-event-trigger/dtos/create-database-event-trigger.input';

export type CreateOneDatabaseEventTriggerFactoryInput =
  CreateDatabaseEventTriggerInput;

const DEFAULT_DATABASE_EVENT_TRIGGER_GQL_FIELDS = `
  id
  settings
`;

export const createOneDatabaseEventTriggerQueryFactory = ({
  input,
  gqlFields = DEFAULT_DATABASE_EVENT_TRIGGER_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateOneDatabaseEventTriggerFactoryInput>) => ({
  query: gql`
    mutation CreateOneDatabaseEventTrigger($input: CreateDatabaseEventTriggerInput!) {
      createOneDatabaseEventTrigger(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
