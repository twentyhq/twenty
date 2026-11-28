import gql from 'graphql-tag';
import { type RecordShareAccessLevel } from 'twenty-shared/types';

export const setRecordShareOperationFactory = ({
  objectMetadataId,
  recordId,
  principal,
  accessLevel,
}: {
  objectMetadataId: string;
  recordId: string;
  principal: { workspaceMemberId: string } | { roleId: string };
  accessLevel: RecordShareAccessLevel;
}) => ({
  query: gql`
    mutation SetRecordShare(
      $target: RecordTargetInput!
      $principal: RecordSharePrincipalInput!
      $accessLevel: RecordShareAccessLevel!
    ) {
      setRecordShare(
        target: $target
        principal: $principal
        accessLevel: $accessLevel
      ) {
        isShareable
      }
    }
  `,
  variables: {
    target: { objectMetadataId, recordId },
    principal,
    accessLevel,
  },
});
