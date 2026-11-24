/* @license Enterprise */

import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { ACCESS_GROUP_TYPES } from 'src/engine/permissions/internal/access-group/constants/access-group-types.constant';
import {
  escapeIdentifier,
  escapeLiteral,
} from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const buildCreateEnumStatement = ({
  schemaName,
  enumName,
  values,
}: {
  schemaName: string;
  enumName: string;
  values: string[];
}): string =>
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_type
      JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
      WHERE pg_namespace.nspname = ${escapeLiteral(schemaName)} AND pg_type.typname = ${escapeLiteral(enumName)}
    ) THEN
      CREATE TYPE ${escapeIdentifier(schemaName)}.${escapeIdentifier(enumName)} AS ENUM (${values.map(escapeLiteral).join(', ')});
    END IF;
  END $$`;

export const buildCreatePermissionTablesStatements = ({
  schemaName,
}: {
  schemaName: string;
}): string[] => {
  const schema = escapeIdentifier(schemaName);
  const recordShare = `${schema}."recordShare"`;
  const accessGroup = `${schema}."accessGroup"`;

  return [
    buildCreateEnumStatement({
      schemaName,
      enumName: 'recordShare_principalType_enum',
      values: Object.values(RecordSharePrincipalType),
    }),
    buildCreateEnumStatement({
      schemaName,
      enumName: 'recordShare_rowCause_enum',
      values: Object.values(RecordShareRowCause),
    }),
    buildCreateEnumStatement({
      schemaName,
      enumName: 'recordShare_accessLevel_enum',
      values: [
        RecordShareAccessLevel.READ,
        RecordShareAccessLevel.READ_WRITE,
        RecordShareAccessLevel.FULL,
        RecordShareAccessLevel.NONE,
      ],
    }),
    `CREATE TABLE IF NOT EXISTS ${recordShare} (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "deletedAt" timestamptz,
      "recordId" uuid NOT NULL,
      "objectMetadataId" uuid NOT NULL,
      "principalId" uuid NOT NULL,
      "principalType" ${schema}."recordShare_principalType_enum" NOT NULL,
      "accessLevel" ${schema}."recordShare_accessLevel_enum" NOT NULL DEFAULT ${escapeLiteral(RecordShareAccessLevel.READ)},
      "rowCause" ${schema}."recordShare_rowCause_enum" NOT NULL,
      "sourceId" uuid NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_UNIQUE_2a8112c19cab880dde4b9b122e0" ON ${recordShare} ("objectMetadataId", "recordId", "principalId", "rowCause", "sourceId")`,
    `CREATE INDEX IF NOT EXISTS "IDX_4a277b3dad18715d2619fee7c5b" ON ${recordShare} ("principalId")`,
    `CREATE INDEX IF NOT EXISTS "IDX_5519b21a3b491ab8b1ce594b119" ON ${recordShare} ("sourceId")`,
    buildCreateEnumStatement({
      schemaName,
      enumName: 'accessGroup_type_enum',
      values: [...ACCESS_GROUP_TYPES],
    }),
    `CREATE TABLE IF NOT EXISTS ${accessGroup} (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "deletedAt" timestamptz,
      "objectMetadataId" uuid,
      "type" ${schema}."accessGroup_type_enum" NOT NULL,
      "ruleShapeHash" varchar NOT NULL,
      "unreadableFieldIds" uuid[] NOT NULL DEFAULT '{}',
      "memberFieldValues" jsonb,
      "value" varchar,
      "groupHash" text NOT NULL,
      "compactId" integer GENERATED ALWAYS AS IDENTITY,
      CONSTRAINT "CHK_ACCESS_GROUP_TYPE_COLUMNS" CHECK (
        ("type" IN ('ALL_RECORDS', 'RLS_RULE') AND "memberFieldValues" IS NULL AND "value" IS NULL)
        OR ("type" = 'RLS_MEMBER_VALUE' AND "memberFieldValues" IS NOT NULL AND "value" IS NULL)
        OR ("type" = 'RLS_LITERAL_VALUE' AND "memberFieldValues" IS NULL AND "value" IS NOT NULL)
      )
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_UNIQUE_b784cebdb5d8238240a4b99b8e2" ON ${accessGroup} ("groupHash")`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_ACCESS_GROUP_COMPACT_ID_UNIQUE" ON ${accessGroup} ("compactId")`,
    `CREATE INDEX IF NOT EXISTS "IDX_3794d47209882e7c43f4f786f33" ON ${accessGroup} ("objectMetadataId")`,
    `CREATE INDEX IF NOT EXISTS "IDX_ACCESS_GROUP_RULE_SHAPE_MEMBER_FIELD_VALUES" ON ${accessGroup} ("ruleShapeHash", "memberFieldValues") WHERE "type" = 'RLS_MEMBER_VALUE'`,
    `CREATE INDEX IF NOT EXISTS "IDX_ACCESS_GROUP_RULE_SHAPE_VALUE" ON ${accessGroup} ("ruleShapeHash", "value") WHERE "type" = 'RLS_LITERAL_VALUE'`,
  ];
};
