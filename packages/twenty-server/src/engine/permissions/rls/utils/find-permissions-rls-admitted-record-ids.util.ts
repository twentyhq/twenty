/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { findPermissionsObjectAdmittedRecordIds } from 'src/engine/permissions/role/utils/find-permissions-object-admitted-record-ids.util';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/permissions/rls/utils/is-record-matching-rls-row-level-permission-predicate.util';

export const findPermissionsRlsAdmittedRecordIds = ({
  records,
  recordFilter,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  shouldIgnoreSoftDeleteDefaultFilter,
  isLimitedToPublicRecords,
  privateRecordStates,
}: {
  records: ({ id: string } & Record<string, unknown>)[];
  recordFilter: RecordGqlOperationFilter;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  shouldIgnoreSoftDeleteDefaultFilter: boolean;
  isLimitedToPublicRecords: boolean;
  privateRecordStates: Map<string, PrivateRecordState>;
}): string[] =>
  findPermissionsObjectAdmittedRecordIds({
    recordIds: records
      .filter((record) =>
        isRecordMatchingRLSRowLevelPermissionPredicate({
          record,
          filter: recordFilter,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          shouldIgnoreSoftDeleteDefaultFilter,
        }),
      )
      .map((record) => record.id),
    isLimitedToPublicRecords,
    privateRecordStates,
  });
