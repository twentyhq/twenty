import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { VIEW_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewFieldObjectMetadata } from 'src/modules/view/standard-objects/view-field.object-metadata';
import { ViewFilterObjectMetadata } from 'src/modules/view/standard-objects/view-filter.object-metadata';
import { ViewSortObjectMetadata } from 'src/modules/view/standard-objects/view-sort.object-metadata';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-object.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.view,
  namePlural: 'views',
  labelSingular: 'View',
  labelPlural: 'Views',
  description: '(System) Views',
  icon: 'IconLayoutCollage',
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class ViewObjectMetadata extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'View name',
  })
  name: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.objectMetadataId,
    type: FieldMetadataType.UUID,
    label: 'Object Metadata Id',
    description: 'View target object',
  })
  objectMetadataId: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.TEXT,
    label: 'Type',
    description: 'View type',
    defaultValue: "'table'",
  })
  type: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.key,
    type: FieldMetadataType.SELECT,
    label: 'Key',
    description: 'View key',
    options: [{ value: 'INDEX', label: 'Index', position: 0, color: 'red' }],
    defaultValue: "'INDEX'",
  })
  @WorkspaceIsNullable()
  key: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.icon,
    type: FieldMetadataType.TEXT,
    label: 'Icon',
    description: 'View icon',
  })
  icon: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.kanbanFieldMetadataId,
    type: FieldMetadataType.TEXT,
    label: 'kanbanfieldMetadataId',
    description: 'View Kanban column field',
  })
  kanbanFieldMetadataId: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Position',
    description: 'View position',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.isCompact,
    type: FieldMetadataType.BOOLEAN,
    label: 'Compact View',
    description: 'Describes if the view is in compact mode',
    defaultValue: false,
  })
  isCompact: boolean;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewFields,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'View Fields',
    description: 'View Fields',
    icon: 'IconTag',
    inverseSideTarget: () => ViewFieldObjectMetadata,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  viewFields: Relation<ViewFieldObjectMetadata[]>;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewFilters,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'View Filters',
    description: 'View Filters',
    icon: 'IconFilterBolt',
    inverseSideTarget: () => ViewFilterObjectMetadata,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  viewFilters: Relation<ViewFilterObjectMetadata[]>;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewSorts,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'View Sorts',
    description: 'View Sorts',
    icon: 'IconArrowsSort',
    inverseSideTarget: () => ViewSortObjectMetadata,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  viewSorts: Relation<ViewSortObjectMetadata[]>;
}
