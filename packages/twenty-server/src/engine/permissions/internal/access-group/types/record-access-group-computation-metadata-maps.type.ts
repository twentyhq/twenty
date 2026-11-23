/* @license Enterprise */

import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';

export type RecordAccessGroupComputationMetadataMaps =
  RecordAccessGroupSQLConditionMetadataMaps & {
    resolvedRelatedRecordPaths: ResolvedRelatedRecordPath[];
  };
