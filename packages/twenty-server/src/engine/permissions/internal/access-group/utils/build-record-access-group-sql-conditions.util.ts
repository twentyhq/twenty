/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { buildRecordAccessGroupSQLConditionOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-record-access-group-sql-condition-or-throw.util';
import { buildSharedAccessGroupsSQLExpression } from 'src/engine/permissions/internal/access-group/utils/build-shared-access-groups-sql-expression.util';
import { SHARED_PREDICATE_MEMBER_FIELD_KEY } from 'src/engine/permissions/internal/access-group/utils/find-rls-rule-shared-predicate.util';
import {
  isSharedPredicateWithValue,
  type SharedPredicateWithValue,
} from 'src/engine/permissions/internal/access-group/utils/is-shared-predicate-with-value.util';
import { RECORD_ACCESS_GROUP_TABLE_ALIAS } from 'src/engine/permissions/internal/record-permission-repository/constants/record-access-group-table-alias.constant';
import { type RecordAccessGroupSQLCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-sql-condition.type';

type SharedAccessGroup = {
  accessGroup: AccessGroup;
  sharedPredicate: SharedPredicateWithValue;
};

const buildSharedPredicateKey = ({
  fieldMetadataId,
  relationFieldMetadataId,
  subFieldName,
  operand,
}: SharedPredicateWithValue): string =>
  [fieldMetadataId, relationFieldMetadataId, subFieldName, operand].join(':');

export const buildRecordAccessGroupSQLConditions = ({
  flatObjectMetadata,
  metadataMaps,
  accessGroups,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
  accessGroups: AccessGroup[];
}): RecordAccessGroupSQLCondition[] => {
  const buildSQLCondition = (
    accessGroup: AccessGroup,
  ): RecordAccessGroupSQLCondition => ({
    compactId: accessGroup.compactId,
    sqlCondition: buildRecordAccessGroupSQLConditionOrThrow({
      accessGroup,
      flatObjectMetadata,
      tableAlias: RECORD_ACCESS_GROUP_TABLE_ALIAS,
      metadataMaps,
    }),
  });
  const ownAccessGroups: AccessGroup[] = [];
  const sharedAccessGroupsByPredicateKey = new Map<
    string,
    SharedAccessGroup[]
  >();

  for (const accessGroup of accessGroups) {
    const sharedPredicate =
      accessGroup.memberFieldValues?.[SHARED_PREDICATE_MEMBER_FIELD_KEY];

    if (!isSharedPredicateWithValue(sharedPredicate)) {
      ownAccessGroups.push(accessGroup);
      continue;
    }

    const predicateKey = buildSharedPredicateKey(sharedPredicate);

    sharedAccessGroupsByPredicateKey.set(predicateKey, [
      ...(sharedAccessGroupsByPredicateKey.get(predicateKey) ?? []),
      { accessGroup, sharedPredicate },
    ]);
  }

  return [
    ...ownAccessGroups.map(buildSQLCondition),
    ...[...sharedAccessGroupsByPredicateKey.values()].flatMap(
      (sharedAccessGroups, index) => {
        const compactIdsSQLExpression = buildSharedAccessGroupsSQLExpression({
          sharedAccessGroups: sharedAccessGroups.map(
            ({ accessGroup, sharedPredicate }) => ({
              compactId: accessGroup.compactId,
              sharedPredicate,
            }),
          ),
          flatObjectMetadata,
          tableAlias: RECORD_ACCESS_GROUP_TABLE_ALIAS,
          metadataMaps,
          parameterSuffix: String(index),
        });

        return isDefined(compactIdsSQLExpression)
          ? [{ compactIdsSQLExpression }]
          : sharedAccessGroups.map(({ accessGroup }) =>
              buildSQLCondition(accessGroup),
            );
      },
    ),
  ];
};
