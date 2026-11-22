import gql from 'graphql-tag';

export const removeRecordShareOperationFactory = ({
  objectMetadataId,
  recordId,
  workspaceMemberId,
}: {
  objectMetadataId: string;
  recordId: string;
  workspaceMemberId: string;
}) => ({
  query: gql`
    mutation RemoveRecordShare(
      $target: RecordTargetInput!
      $principal: RecordSharePrincipalInput!
    ) {
      removeRecordShare(target: $target, principal: $principal) {
        isShareable
      }
    }
  `,
  variables: {
    target: { objectMetadataId, recordId },
    principal: { workspaceMemberId },
  },
});
