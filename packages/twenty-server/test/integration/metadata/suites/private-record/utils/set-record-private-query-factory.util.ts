/* @license Enterprise */

import gql from 'graphql-tag';

export type SetRecordPrivateFactoryInput = {
  objectMetadataId: string;
  recordId: string;
  isPrivate: boolean;
};

export const setRecordPrivateQueryFactory = ({
  objectMetadataId,
  recordId,
  isPrivate,
}: SetRecordPrivateFactoryInput) => ({
  query: gql`
    mutation SetRecordPrivate(
      $target: RecordTargetInput!
      $isPrivate: Boolean!
    ) {
      setRecordPrivate(target: $target, isPrivate: $isPrivate) {
        isPrivate
      }
    }
  `,
  variables: { target: { objectMetadataId, recordId }, isPrivate },
});
