import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateCronTriggerInput } from 'src/engine/metadata-modules/cron-trigger/dtos/create-cron-trigger.input';

export type CreateOneCronTriggerFactoryInput = CreateCronTriggerInput;

const DEFAULT_CRON_TRIGGER_GQL_FIELDS = `
  id
  settings
`;

export const createOneCronTriggerQueryFactory = ({
  input,
  gqlFields = DEFAULT_CRON_TRIGGER_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateOneCronTriggerFactoryInput>) => ({
  query: gql`
    mutation CreateOneCronTrigger($input: CreateCronTriggerInput!) {
      createOneCronTrigger(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
