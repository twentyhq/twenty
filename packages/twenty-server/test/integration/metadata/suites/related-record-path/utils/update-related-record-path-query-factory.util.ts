/* @license Enterprise */

import gql from 'graphql-tag';
import { RELATED_RECORD_PATH_GQL_FIELDS } from 'test/integration/metadata/suites/related-record-path/utils/related-record-path-gql-fields.constant';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type UpdateRelatedRecordPathFactoryInput = {
  id: string;
  isInherent?: boolean;
  isActive?: boolean;
};

export const updateRelatedRecordPathQueryFactory = ({
  input,
  gqlFields = RELATED_RECORD_PATH_GQL_FIELDS,
}: PerformMetadataQueryParams<UpdateRelatedRecordPathFactoryInput>) => ({
  query: gql`
    mutation UpdateRelatedRecordPath($input: UpdateRelatedRecordPathInput!) {
      updateRelatedRecordPath(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: { input },
});
