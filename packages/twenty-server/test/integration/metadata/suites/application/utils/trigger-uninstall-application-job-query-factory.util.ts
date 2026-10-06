import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type TriggerUninstallApplicationJobFactoryInput = {
  universalIdentifier: string;
};

const DEFAULT_TRIGGER_UNINSTALL_APPLICATION_JOB_GQL_FIELDS = `
  jobId
`;

export const triggerUninstallApplicationJobQueryFactory = ({
  input,
  gqlFields = DEFAULT_TRIGGER_UNINSTALL_APPLICATION_JOB_GQL_FIELDS,
}: PerformMetadataQueryParams<TriggerUninstallApplicationJobFactoryInput>) => ({
  query: gql`
    mutation TriggerUninstallApplicationJob($input: TriggerUninstallApplicationJobInput!) {
      triggerUninstallApplicationJob(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: { universalIdentifier: input.universalIdentifier },
  },
});
