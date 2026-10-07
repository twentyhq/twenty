import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type TriggerUpgradeApplicationJobFactoryInput = {
  universalIdentifier: string;
  targetVersion: string;
};

const DEFAULT_TRIGGER_UPGRADE_APPLICATION_JOB_GQL_FIELDS = `
  jobId
`;

export const triggerUpgradeApplicationJobQueryFactory = ({
  input,
  gqlFields = DEFAULT_TRIGGER_UPGRADE_APPLICATION_JOB_GQL_FIELDS,
}: PerformMetadataQueryParams<TriggerUpgradeApplicationJobFactoryInput>) => ({
  query: gql`
    mutation TriggerUpgradeApplicationJob($input: TriggerUpgradeApplicationJobInput!) {
      triggerUpgradeApplicationJob(input: $input) {
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
