import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { VIEW_SORT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { ViewObjectMetadata } from 'src/modules/view/standard-objects/view.object-metadata';
import { IsNotAuditLogged } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-not-audit-logged.decorator';

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.viewSort,
  namePlural: 'viewSorts',
  labelSingular: 'View Sort',
  labelPlural: 'View Sorts',
  description: '(System) View Sorts',
  icon: 'IconArrowsSort',
})
@IsNotAuditLogged()
@IsSystem()
export class ViewSortObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: VIEW_SORT_STANDARD_FIELD_IDS.fieldMetadataId,
    type: FieldMetadataType.UUID,
    label: 'Field Metadata Id',
    description: 'View Sort target field',
    icon: 'IconTag',
  })
  fieldMetadataId: string;

  @FieldMetadata({
    standardId: VIEW_SORT_STANDARD_FIELD_IDS.direction,
    type: FieldMetadataType.TEXT,
    label: 'Direction',
    description: 'View Sort direction',
    defaultValue: "'asc'",
  })
  direction: string;

  @FieldMetadata({
    standardId: VIEW_SORT_STANDARD_FIELD_IDS.view,
    type: FieldMetadataType.RELATION,
    label: 'View',
    description: 'View Sort related view',
    icon: 'IconLayoutCollage',
    joinColumn: 'viewId',
  })
  @IsNullable()
  view: Relation<ViewObjectMetadata>;
}
