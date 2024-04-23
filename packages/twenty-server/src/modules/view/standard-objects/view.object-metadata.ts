import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { VIEW_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { ViewFieldObjectMetadata } from 'src/modules/view/standard-objects/view-field.object-metadata';
import { ViewFilterObjectMetadata } from 'src/modules/view/standard-objects/view-filter.object-metadata';
import { ViewSortObjectMetadata } from 'src/modules/view/standard-objects/view-sort.object-metadata';
import { IsNotAuditLogged } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-not-audit-logged.decorator';

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.view,
  namePlural: 'views',
  labelSingular: 'View',
  labelPlural: 'Views',
  description: '(System) Views',
  icon: 'IconLayoutCollage',
})
@IsNotAuditLogged()
@IsSystem()
export class ViewObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: VIEW_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'View name',
  })
  name: string;

  @FieldMetadata({
    standardId: VIEW_STANDARD_FIELD_IDS.objectMetadataId,
    type: FieldMetadataType.UUID,
    label: 'Object Metadata Id',
    description: 'View target object',
  })
  objectMetadataId: string;

  @FieldMetadata({
    standardId: VIEW_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.TEXT,
    label: 'Type',
    description: 'View type',
    defaultValue: "'table'",
  })
  type: string;

  @FieldMetadata({
    standardId: VIEW_STANDARD_FIELD_IDS.key,
    type: FieldMetadataType.SELECT,
    label: 'Key',
    description: 'View key',
    options: [{ value: 'INDEX', label: 'Index', position: 0, color: 'red' }],
    defaultValue: "'INDEX'",
  })
  @IsNullable()
  key: string;

  @FieldMetadata({
    standardId: VIEW_STANDARD_FIELD_IDS.icon,
    type: FieldMetadataType.TEXT,
    label: 'Icon',
    description: 'View icon',
  })
  icon: string;

  @FieldMetadata({
    standardId: VIEW_STANDARD_FIELD_IDS.kanbanFieldMetadataId,
    type: FieldMetadataType.TEXT,
    label: 'kanbanfieldMetadataId',
    description: 'View Kanban column field',
  })
  kanbanFieldMetadataId: string;

  @FieldMetadata({
    standardId: VIEW_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Position',
    description: 'View position',
  })
  @IsNullable()
  position: number;

  @FieldMetadata({
    standardId: VIEW_STANDARD_FIELD_IDS.isCompact,
    type: FieldMetadataType.BOOLEAN,
    label: 'Compact View',
    description: 'Describes if the view is in compact mode',
    defaultValue: false,
  })
  isCompact: boolean;

  @FieldMetadata({
    standardId: VIEW_STANDARD_FIELD_IDS.viewFields,
    type: FieldMetadataType.RELATION,
    label: 'View Fields',
    description: 'View Fields',
    icon: 'IconTag',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ViewFieldObjectMetadata,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @IsNullable()
  viewFields: Relation<ViewFieldObjectMetadata[]>;

  @FieldMetadata({
    standardId: VIEW_STANDARD_FIELD_IDS.viewFilters,
    type: FieldMetadataType.RELATION,
    label: 'View Filters',
    description: 'View Filters',
    icon: 'IconFilterBolt',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ViewFilterObjectMetadata,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @IsNullable()
  viewFilters: Relation<ViewFilterObjectMetadata[]>;

  @FieldMetadata({
    standardId: VIEW_STANDARD_FIELD_IDS.viewSorts,
    type: FieldMetadataType.RELATION,
    label: 'View Sorts',
    description: 'View Sorts',
    icon: 'IconArrowsSort',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ViewSortObjectMetadata,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @IsNullable()
  viewSorts: Relation<ViewSortObjectMetadata[]>;
}
