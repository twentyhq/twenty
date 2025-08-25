import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MKT_ORGANIZATION_LEVEL_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktOrganizationLevel,
  namePlural: 'mktOrganizationLevels',
  labelSingular: msg`Organization Level`,
  labelPlural: msg`Organization Levels`,
  description: msg`Organizational hierarchy levels in the marketing system.`,
  icon: 'IconHierarchy',
  shortcut: 'L',
})
@WorkspaceIsSearchable()
export class MktOrganizationLevelWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_ORGANIZATION_LEVEL_FIELD_IDS.levelCode,
    type: FieldMetadataType.TEXT,
    label: msg`Level Code`,
    description: msg`Unique level code`,
    icon: 'IconCode',
  })
  levelCode: string;

  @WorkspaceField({
    standardId: MKT_ORGANIZATION_LEVEL_FIELD_IDS.levelName,
    type: FieldMetadataType.TEXT,
    label: msg`Level Name`,
    description: msg`Display name of the level`,
    icon: 'IconTag',
  })
  levelName: string;

  @WorkspaceField({
    standardId: MKT_ORGANIZATION_LEVEL_FIELD_IDS.levelNameEn,
    type: FieldMetadataType.TEXT,
    label: msg`Level Name (English)`,
    description: msg`English name of the level`,
    icon: 'IconLanguage',
  })
  @WorkspaceIsNullable()
  levelNameEn?: string;

  @WorkspaceField({
    standardId: MKT_ORGANIZATION_LEVEL_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: msg`Detailed description of the level`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  description?: string;

  @WorkspaceField({
    standardId: MKT_ORGANIZATION_LEVEL_FIELD_IDS.hierarchyLevel,
    type: FieldMetadataType.NUMBER,
    label: msg`Hierarchy Level`,
    description: msg`Numeric hierarchy level (1 = highest)`,
    icon: 'IconStairs',
  })
  hierarchyLevel: number;

  @WorkspaceField({
    standardId: MKT_ORGANIZATION_LEVEL_FIELD_IDS.parentLevel,
    type: FieldMetadataType.TEXT,
    label: msg`Parent Level ID`,
    description: msg`ID of parent level in hierarchy`,
    icon: 'IconArrowUp',
  })
  @WorkspaceIsNullable()
  parentLevelId?: string;

  @WorkspaceField({
    standardId: MKT_ORGANIZATION_LEVEL_FIELD_IDS.defaultPermissions,
    type: FieldMetadataType.TEXT,
    label: msg`Default Permissions`,
    description: msg`Default permissions for this level`,
    icon: 'IconLock',
  })
  @WorkspaceIsNullable()
  defaultPermissions?: string;

  @WorkspaceField({
    standardId: MKT_ORGANIZATION_LEVEL_FIELD_IDS.accessLimitations,
    type: FieldMetadataType.TEXT,
    label: msg`Access Limitations`,
    description: msg`Access limitations for this level`,
    icon: 'IconShieldCheck',
  })
  @WorkspaceIsNullable()
  accessLimitations?: string;

  @WorkspaceField({
    standardId: MKT_ORGANIZATION_LEVEL_FIELD_IDS.displayOrder,
    type: FieldMetadataType.NUMBER,
    label: msg`Display Order`,
    description: msg`Order of display in level list`,
    icon: 'IconList',
  })
  displayOrder: number;

  @WorkspaceField({
    standardId: MKT_ORGANIZATION_LEVEL_FIELD_IDS.isActive,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Active`,
    description: msg`Whether this level is currently active`,
    icon: 'IconCheck',
  })
  @WorkspaceIsNullable()
  isActive?: boolean;

  @WorkspaceField({
    standardId: MKT_ORGANIZATION_LEVEL_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: MKT_ORGANIZATION_LEVEL_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: MKT_ORGANIZATION_LEVEL_FIELD_IDS.staffMembers,
    type: RelationType.ONE_TO_MANY,
    label: msg`People`,
    description: msg`People at this organization level`,
    icon: 'IconUsers',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'organizationLevel',
  })
  people: Relation<WorkspaceMemberWorkspaceEntity[]>;
}
