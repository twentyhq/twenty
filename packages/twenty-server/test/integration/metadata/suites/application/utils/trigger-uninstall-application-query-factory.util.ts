import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type TriggerUninstallApplicationFactoryInput = {
  universalIdentifier: string;
};

const DEFAULT_TRIGGER_UNINSTALL_APPLICATION_JOB_GQL_FIELDS = `
  jobId
`;

export const triggerUninstallApplicationQueryFactory = ({
  input,
  gqlFields = DEFAULT_TRIGGER_UNINSTALL_APPLICATION_JOB_GQL_FIELDS,
}: PerformMetadataQueryParams<TriggerUninstallApplicationFactoryInput>) => ({
  query: gql`
    mutation TriggerUninstallApplication($input: TriggerUninstallApplicationInput!) {
      triggerUninstallApplication(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: { universalIdentifier: input.universalIdentifier },
  },
});
