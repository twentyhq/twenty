import {
  FeatureFlagKey,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import {
  type BuildEntrySQLCondition,
  buildRelatedRecordPathsSQLCondition,
} from 'src/engine/permissions/internal/related-record-path/utils/build-related-record-paths-sql-condition.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';
const SCHEMA = getWorkspaceSchemaName(WORKSPACE_ID);

const buildFlatEntityMaps = <TEntity extends { id: string }>(
  entities: TEntity[],
) =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      entities.map((entity) => [entity.id, entity]),
    ),
    universalIdentifierById: Object.fromEntries(
      entities.map((entity) => [entity.id, entity.id]),
    ),
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatEntityMaps<never>;

const buildObject = (nameSingular: string) =>
  ({
    id: nameSingular,
    universalIdentifier: nameSingular,
    nameSingular,
  }) as FlatObjectMetadata;

const buildRelationField = ({
  id,
  objectMetadataId,
  relationTargetObjectMetadataId,
  relationType,
  joinColumnName,
  relationTargetFieldMetadataId,
}: {
  id: string;
  objectMetadataId: string;
  relationTargetObjectMetadataId: string;
  relationType: RelationType;
  joinColumnName?: string;
  relationTargetFieldMetadataId?: string;
}) =>
  ({
    id,
    universalIdentifier: id,
    name: id,
    objectMetadataId,
    type: FieldMetadataType.RELATION,
    isActive: true,
    relationTargetObjectMetadataId,
    relationTargetFieldMetadataId,
    settings: { relationType, joinColumnName },
  }) as unknown as OrmFlatFieldMetadata;

const buildPath = ({
  id,
  objectMetadataId,
  firstFieldMetadataId,
  isInherent,
}: {
  id: string;
  objectMetadataId: string;
  firstFieldMetadataId: string;
  isInherent: boolean;
}) =>
  ({
    id,
    universalIdentifier: id,
    objectMetadataId,
    firstFieldMetadataId,
    secondFieldMetadataId: null,
    thirdFieldMetadataId: null,
    isInherent,
  }) as FlatRelatedRecordPath;

const company = buildObject('company');
const attachment = buildObject('attachment');
const opportunity = buildObject('opportunity');

const fields = [
  buildRelationField({
    id: 'companyAttachments',
    objectMetadataId: 'company',
    relationTargetObjectMetadataId: 'attachment',
    relationType: RelationType.ONE_TO_MANY,
    relationTargetFieldMetadataId: 'attachmentTargetCompany',
  }),
  buildRelationField({
    id: 'attachmentTargetCompany',
    objectMetadataId: 'attachment',
    relationTargetObjectMetadataId: 'company',
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'targetCompanyId',
  }),
  buildRelationField({
    id: 'companyOpportunities',
    objectMetadataId: 'company',
    relationTargetObjectMetadataId: 'opportunity',
    relationType: RelationType.ONE_TO_MANY,
    relationTargetFieldMetadataId: 'opportunityCompany',
  }),
  buildRelationField({
    id: 'opportunityCompany',
    objectMetadataId: 'opportunity',
    relationTargetObjectMetadataId: 'company',
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'companyId',
  }),
];

const companyAttachmentsPath = buildPath({
  id: 'companyAttachmentsPath',
  objectMetadataId: 'company',
  firstFieldMetadataId: 'companyAttachments',
  isInherent: true,
});

const buildMetadataMaps = ({
  paths,
  objectNamesWithRlsRule = ['company', 'opportunity'],
  isAccessGroupsEnabled = true,
}: {
  paths: FlatRelatedRecordPath[];
  objectNamesWithRlsRule?: string[];
  isAccessGroupsEnabled?: boolean;
}): PermissionsMetadataMaps =>
  ({
    featureFlagsMap: {
      [FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED]: isAccessGroupsEnabled,
    },
    rolesPermissions: {
      sales: {
        objects: Object.fromEntries(
          objectNamesWithRlsRule.map((objectName) => [
            objectName,
            { rowLevelRecordsPermissions: [] },
          ]),
        ),
      },
    },
    flatObjectMetadataMaps: buildFlatEntityMaps([
      company,
      attachment,
      opportunity,
    ]),
    flatFieldMetadataMaps: buildFlatEntityMaps(fields),
    flatRelatedRecordPathMaps: buildFlatEntityMaps(paths),
  }) as unknown as PermissionsMetadataMaps;

const buildEntrySQLConditionFrom =
  (entryByObject: Record<string, boolean | 'owned'>): BuildEntrySQLCondition =>
  ({ flatObjectMetadata, tableAlias }) => {
    const entry = entryByObject[flatObjectMetadata.nameSingular] ?? false;

    return entry === 'owned'
      ? {
          sql: `"${tableAlias}"."ownerId" = :${tableAlias}Owner`,
          parameters: { [`${tableAlias}Owner`]: 'member-id' },
        }
      : entry;
  };

const buildAttachmentCondition = ({
  entryByObject,
  disabledObjectNames = [],
  privateObjectNames = [],
  isUncorrelated,
  ...metadataMapsArgs
}: Parameters<typeof buildMetadataMaps>[0] & {
  isUncorrelated?: boolean;
  entryByObject: Record<string, boolean | 'owned'>;
  disabledObjectNames?: string[];
  privateObjectNames?: string[];
}) =>
  buildRelatedRecordPathsSQLCondition({
    workspaceId: WORKSPACE_ID,
    flatObjectMetadata: attachment,
    tableAlias: 'attachment',
    metadataMaps: buildMetadataMaps(metadataMapsArgs),
    buildEntrySQLCondition: buildEntrySQLConditionFrom(entryByObject),
    canRelatedRecordPathsReachObject: (flatObjectMetadata) =>
      !disabledObjectNames.includes(flatObjectMetadata.nameSingular),
    isRecordPrivacyApplicable: (flatObjectMetadata) =>
      privateObjectNames.includes(flatObjectMetadata.nameSingular),
    isUncorrelated,
  });

describe('buildRelatedRecordPathsSQLCondition', () => {
  it('returns the entry condition when no path leads to the object', () => {
    expect(
      buildAttachmentCondition({
        paths: [],
        entryByObject: { attachment: 'owned' },
      }),
    ).toEqual({
      sql: '"attachment"."ownerId" = :attachmentOwner',
      parameters: { attachmentOwner: 'member-id' },
    });
  });

  it('reads the reachable source records once when asked for an uncorrelated condition', () => {
    expect(
      buildAttachmentCondition({
        paths: [companyAttachmentsPath],
        entryByObject: { company: 'owned' },
        isUncorrelated: true,
      }),
    ).toEqual({
      sql: `"attachment"."targetCompanyId" = ANY(ARRAY(SELECT "related_record_path_0"."id" FROM "${SCHEMA}"."_company" AS "related_record_path_0" WHERE "related_record_path_0"."deletedAt" IS NULL AND ("related_record_path_0"."ownerId" = :related_record_path_0Owner)))`,
      parameters: { related_record_path_0Owner: 'member-id' },
    });
  });

  it('does not reach a private record through a path', () => {
    const sqlCondition = buildAttachmentCondition({
      paths: [companyAttachmentsPath],
      entryByObject: { company: true },
      privateObjectNames: ['attachment'],
    });

    expect(sqlCondition).toMatchObject({
      sql: expect.stringMatching(
        /EXISTS \(.*\).* AND .*"attachment"\."_isPrivate"/,
      ),
    });
  });

  it('skips paths when every record is reachable directly', () => {
    expect(
      buildAttachmentCondition({
        paths: [companyAttachmentsPath],
        entryByObject: { attachment: true, company: 'owned' },
      }),
    ).toBe(true);
  });

  it('grants records whose source record is readable', () => {
    expect(
      buildAttachmentCondition({
        paths: [companyAttachmentsPath],
        entryByObject: { company: 'owned' },
      }),
    ).toEqual({
      sql: `EXISTS (SELECT 1 FROM "${SCHEMA}"."_company" AS "related_record_path_0" WHERE "attachment"."targetCompanyId" = "related_record_path_0"."id" AND "related_record_path_0"."deletedAt" IS NULL AND ("related_record_path_0"."ownerId" = :related_record_path_0Owner))`,
      parameters: { related_record_path_0Owner: 'member-id' },
    });
  });

  it('ignores a path whose source object has no RLS rule', () => {
    expect(
      buildAttachmentCondition({
        paths: [companyAttachmentsPath],
        objectNamesWithRlsRule: [],
        entryByObject: { company: 'owned' },
      }),
    ).toBe(false);
  });

  it('follows an inherent path whose source is reached from an object with an RLS rule', () => {
    expect(
      buildAttachmentCondition({
        paths: [
          companyAttachmentsPath,
          buildPath({
            id: 'opportunityCompanyPath',
            objectMetadataId: 'opportunity',
            firstFieldMetadataId: 'opportunityCompany',
            isInherent: false,
          }),
        ],
        objectNamesWithRlsRule: ['opportunity'],
        entryByObject: { opportunity: 'owned' },
      }),
    ).not.toBe(false);
  });

  it('ignores paths while access groups are disabled', () => {
    expect(
      buildAttachmentCondition({
        paths: [companyAttachmentsPath],
        isAccessGroupsEnabled: false,
        entryByObject: { company: 'owned' },
      }),
    ).toBe(false);
  });

  it('denies records when the source object is not reachable', () => {
    expect(
      buildAttachmentCondition({
        paths: [companyAttachmentsPath],
        entryByObject: {},
      }),
    ).toBe(false);
  });

  it('chains an inherent path through a path leading to its source', () => {
    const condition = buildAttachmentCondition({
      paths: [
        companyAttachmentsPath,
        buildPath({
          id: 'opportunityCompanyPath',
          objectMetadataId: 'opportunity',
          firstFieldMetadataId: 'opportunityCompany',
          isInherent: false,
        }),
      ],
      entryByObject: { opportunity: 'owned' },
    }) as SQLCondition;

    expect(condition.sql).toBe(
      `EXISTS (SELECT 1 FROM "${SCHEMA}"."_company" AS "related_record_path_0" WHERE "attachment"."targetCompanyId" = "related_record_path_0"."id" AND "related_record_path_0"."deletedAt" IS NULL AND (EXISTS (SELECT 1 FROM "${SCHEMA}"."_opportunity" AS "related_record_path_1" WHERE "related_record_path_0"."id" = "related_record_path_1"."companyId" AND "related_record_path_1"."deletedAt" IS NULL AND ("related_record_path_1"."ownerId" = :related_record_path_1Owner))))`,
    );
  });

  it('does not chain a non-inherent path past its source', () => {
    expect(
      buildAttachmentCondition({
        paths: [
          { ...companyAttachmentsPath, isInherent: false },
          buildPath({
            id: 'opportunityCompanyPath',
            objectMetadataId: 'opportunity',
            firstFieldMetadataId: 'opportunityCompany',
            isInherent: false,
          }),
        ],
        entryByObject: { opportunity: 'owned' },
      }),
    ).toBe(false);
  });

  it('stops on inherent paths saved as a cycle', () => {
    const condition = buildAttachmentCondition({
      paths: [
        companyAttachmentsPath,
        buildPath({
          id: 'opportunityCompanyPath',
          objectMetadataId: 'opportunity',
          firstFieldMetadataId: 'opportunityCompany',
          isInherent: true,
        }),
        buildPath({
          id: 'companyOpportunitiesPath',
          objectMetadataId: 'company',
          firstFieldMetadataId: 'companyOpportunities',
          isInherent: true,
        }),
      ],
      entryByObject: { opportunity: 'owned' },
    }) as SQLCondition;

    expect(condition.sql.match(/EXISTS/g)).toHaveLength(2);
  });

  it('does not pass access through an object whose operation is disabled', () => {
    expect(
      buildAttachmentCondition({
        paths: [
          companyAttachmentsPath,
          buildPath({
            id: 'opportunityCompanyPath',
            objectMetadataId: 'opportunity',
            firstFieldMetadataId: 'opportunityCompany',
            isInherent: true,
          }),
        ],
        entryByObject: { opportunity: 'owned' },
        disabledObjectNames: ['company'],
      }),
    ).toBe(false);
  });

  it('ignores paths through inactive fields', () => {
    const metadataMaps = buildMetadataMaps({
      paths: [companyAttachmentsPath],
    });

    metadataMaps.flatFieldMetadataMaps.byUniversalIdentifier.companyAttachments =
      { ...fields[0], isActive: false };

    expect(
      buildRelatedRecordPathsSQLCondition({
        workspaceId: WORKSPACE_ID,
        flatObjectMetadata: attachment,
        tableAlias: 'attachment',
        metadataMaps,
        buildEntrySQLCondition: buildEntrySQLConditionFrom({
          company: true,
        }),
        canRelatedRecordPathsReachObject: () => true,
        isRecordPrivacyApplicable: () => false,
      }),
    ).toBe(false);
  });
});
