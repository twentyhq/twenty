import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type TriggerInstallApplicationJobFactoryInput = {
  universalIdentifier: string;
};

const DEFAULT_TRIGGER_INSTALL_APPLICATION_JOB_GQL_FIELDS = `
  jobId
`;

export const triggerInstallApplicationJobQueryFactory = ({
  input,
  gqlFields = DEFAULT_TRIGGER_INSTALL_APPLICATION_JOB_GQL_FIELDS,
}: PerformMetadataQueryParams<TriggerInstallApplicationJobFactoryInput>) => ({
  query: gql`
    mutation TriggerInstallApplicationJob($input: TriggerInstallApplicationJobInput!) {
      triggerInstallApplicationJob(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: { universalIdentifier: input.universalIdentifier },
  },
});
