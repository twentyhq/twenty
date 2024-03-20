import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { pipelineStepStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { OpportunityObjectMetadata } from 'src/modules/opportunity/standard-objects/opportunity.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.pipelineStep,
  namePlural: 'pipelineSteps',
  labelSingular: 'Pipeline Step',
  labelPlural: 'Pipeline Steps',
  description: 'A pipeline step',
  icon: 'IconLayoutKanban',
})
@IsSystem()
export class PipelineStepObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: pipelineStepStandardFieldIds.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'Pipeline Step name',
    icon: 'IconCurrencyDollar',
  })
  name: string;

  @FieldMetadata({
    standardId: pipelineStepStandardFieldIds.color,
    type: FieldMetadataType.TEXT,
    label: 'Color',
    description: 'Pipeline Step color',
    icon: 'IconColorSwatch',
  })
  color: string;

  @FieldMetadata({
    standardId: pipelineStepStandardFieldIds.position,
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
    standardId: pipelineStepStandardFieldIds.opportunities,
    type: FieldMetadataType.RELATION,
    label: 'Opportunities',
    description: 'Opportunities linked to the step.',
    icon: 'IconTargetArrow',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => OpportunityObjectMetadata,
  })
  @IsNullable()
  opportunities: OpportunityObjectMetadata[];
}
