import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type TriggerUpgradeApplicationFactoryInput = {
  universalIdentifier: string;
  targetVersion: string;
};

const DEFAULT_TRIGGER_UPGRADE_APPLICATION_JOB_GQL_FIELDS = `
  jobId
`;

export const triggerUpgradeApplicationQueryFactory = ({
  input,
  gqlFields = DEFAULT_TRIGGER_UPGRADE_APPLICATION_JOB_GQL_FIELDS,
}: PerformMetadataQueryParams<TriggerUpgradeApplicationFactoryInput>) => ({
  query: gql`
    mutation TriggerUpgradeApplication($input: TriggerUpgradeApplicationInput!) {
      triggerUpgradeApplication(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: {
      universalIdentifier: input.universalIdentifier,
      targetVersion: input.targetVersion,
    },
  },
});
