/* @license Enterprise */

import gql from 'graphql-tag';
import { RELATED_RECORD_PATH_GQL_FIELDS } from 'test/integration/metadata/suites/related-record-path/utils/related-record-path-gql-fields.constant';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type CreateRelatedRecordPathFactoryInput = {
  objectMetadataId: string;
  firstFieldMetadataId: string;
  secondFieldMetadataId?: string;
  thirdFieldMetadataId?: string;
};

export const createRelatedRecordPathQueryFactory = ({
  input,
  gqlFields = RELATED_RECORD_PATH_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateRelatedRecordPathFactoryInput>) => ({
  query: gql`
    mutation CreateRelatedRecordPath($input: CreateRelatedRecordPathInput!) {
      createRelatedRecordPath(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: { input },
});
