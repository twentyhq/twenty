import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type TriggerInstallApplicationFactoryInput = {
  universalIdentifier: string;
};

const DEFAULT_TRIGGER_INSTALL_APPLICATION_JOB_GQL_FIELDS = `
  jobId
`;

export const triggerInstallApplicationQueryFactory = ({
  input,
  gqlFields = DEFAULT_TRIGGER_INSTALL_APPLICATION_JOB_GQL_FIELDS,
}: PerformMetadataQueryParams<TriggerInstallApplicationFactoryInput>) => ({
  query: gql`
    mutation TriggerInstallApplication($input: TriggerInstallApplicationInput!) {
      triggerInstallApplication(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: { universalIdentifier: input.universalIdentifier },
  },
});
