import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { ViewObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/view.object-metadata';

@ObjectMetadata({
  namePlural: 'viewFields',
  labelSingular: 'فیلد نما',
  labelPlural: 'فیلد های نما',
  description: '(System) View Fields',
  icon: 'IconTag',
})
@IsSystem()
export class ViewFieldObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.UUID,
    label: 'Field Metadata Id',
    description: 'View Field target field',
    icon: 'IconTag',
  })
  fieldMetadataId: string;

  @FieldMetadata({
    type: FieldMetadataType.BOOLEAN,
    label: 'قابل مشاهده بودن',
    description: 'قابل مشاهده بودن فیلد',
    icon: 'IconEye',
    defaultValue: { value: true },
  })
  isVisible: boolean;

  @FieldMetadata({
    type: FieldMetadataType.NUMBER,
    label: 'اندازه',
    description: 'اندازه فیلد نما',
    icon: 'IconEye',
    defaultValue: { value: 0 },
  })
  size: number;

  @FieldMetadata({
    type: FieldMetadataType.NUMBER,
    label: 'موقعیت',
    description: 'موقعیت فیلد نما',
    icon: 'IconList',
    defaultValue: { value: 0 },
  })
  position: number;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'نما',
    description: 'View Field related view',
    icon: 'IconLayoutCollage',
    joinColumn: 'viewId',
  })
  @IsNullable()
  view?: ViewObjectMetadata;
}
