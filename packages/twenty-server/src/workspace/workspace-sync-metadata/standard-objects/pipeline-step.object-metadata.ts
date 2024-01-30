import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/workspace/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { OpportunityObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/opportunity.object-metadata';

@ObjectMetadata({
  namePlural: 'pipelineSteps',
  labelSingular: 'مرحله خط لوله',
  labelPlural: 'مراحل خط لوله',
  description: 'A pipeline step',
  icon: 'IconLayoutKanban',
})
@IsSystem()
export class PipelineStepObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'نام',
    description: 'نام مرحله',
    icon: 'IconCurrencyDollar',
  })
  name: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'رنگ',
    description: 'رنگ مرحله',
    icon: 'IconColorSwatch',
  })
  color: string;

  @FieldMetadata({
    type: FieldMetadataType.NUMBER,
    label: 'موقعیت',
    description: 'موقعیت مرحله',
    icon: 'IconHierarchy2',
    defaultValue: { value: 0 },
  })
  @IsNullable()
  position: number;

  // Relations
  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'فرصت ها',
    description: 'فرصت های مرتبط با مرحله.',
    icon: 'IconTargetArrow',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'opportunity',
  })
  @IsNullable()
  opportunities: OpportunityObjectMetadata[];
}
