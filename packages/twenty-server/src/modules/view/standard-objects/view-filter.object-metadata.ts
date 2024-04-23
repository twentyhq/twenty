import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { VIEW_FILTER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { ViewObjectMetadata } from 'src/modules/view/standard-objects/view.object-metadata';
import { IsNotAuditLogged } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-not-audit-logged.decorator';

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.viewFilter,
  namePlural: 'viewFilters',
  labelSingular: 'View Filter',
  labelPlural: 'View Filters',
  description: '(System) View Filters',
  icon: 'IconFilterBolt',
})
@IsNotAuditLogged()
@IsSystem()
export class ViewFilterObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.fieldMetadataId,
    type: FieldMetadataType.UUID,
    label: 'Field Metadata Id',
    description: 'View Filter target field',
  })
  fieldMetadataId: string;

  @FieldMetadata({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.operand,
    type: FieldMetadataType.TEXT,
    label: 'Operand',
    description: 'View Filter operand',
    defaultValue: "'Contains'",
  })
  operand: string;

  @FieldMetadata({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.value,
    type: FieldMetadataType.TEXT,
    label: 'Value',
    description: 'View Filter value',
  })
  value: string;

  @FieldMetadata({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.displayValue,
    type: FieldMetadataType.TEXT,
    label: 'Display Value',
    description: 'View Filter Display Value',
  })
  displayValue: string;

  @FieldMetadata({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.view,
    type: FieldMetadataType.RELATION,
    label: 'View',
    description: 'View Filter related view',
    icon: 'IconLayoutCollage',
    joinColumn: 'viewId',
  })
  @IsNullable()
  view: Relation<ViewObjectMetadata>;
}
