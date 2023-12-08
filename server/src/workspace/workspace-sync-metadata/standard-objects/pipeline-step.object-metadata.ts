import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import {
  ObjectMetadata,
  FieldMetadata,
  IsNullable,
  IsSystem,
  RelationMetadata,
} from 'src/workspace/workspace-sync-metadata/decorators/metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { OpportunityObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/opportunity.object-metadata';

@ObjectMetadata({
  namePlural: 'pipelineSteps',
  labelSingular: 'Pipeline Step',
  labelPlural: 'Pipeline Steps',
  description: 'A pipeline step',
  icon: 'IconLayoutKanban',
})
@IsSystem()
export class PipelineStepObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'Pipeline Step name',
    icon: 'IconCurrencyDollar',
  })
  @IsNullable()
  name: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Color',
    description: 'Pipeline Step color',
    icon: 'IconColorSwatch',
  })
  @IsNullable()
  color: string;

  @FieldMetadata({
    type: FieldMetadataType.NUMBER,
    label: 'Position',
    description: 'Pipeline Step position',
    icon: 'IconHierarchy2',
    defaultValue: { value: 0 },
  })
  @IsNullable()
  position: number;

  // Relations
  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Opportunities',
    description: 'Opportunities linked to the step.',
    icon: 'IconTargetArrow',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'opportunity',
  })
  @IsNullable()
  opportunities: OpportunityObjectMetadata[];
}
