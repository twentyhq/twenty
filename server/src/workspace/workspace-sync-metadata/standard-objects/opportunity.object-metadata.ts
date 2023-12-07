import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  ObjectMetadata,
  IsSystem,
  FieldMetadata,
  IsNullable,
} from 'src/workspace/workspace-sync-metadata/decorators/metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';

@ObjectMetadata({
  namePlural: 'opportunities',
  labelSingular: 'Opportunity',
  labelPlural: 'Opportunities',
  description: 'An opportunity',
  icon: 'IconTargetArrow',
})
export class OpportunityObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.CURRENCY,
    label: 'Amount',
    description: 'Opportunity amount',
    icon: 'IconCurrencyDollar',
  })
  @IsNullable()
  amount: string;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Close date',
    description: 'Opportunity close date',
    icon: 'IconCalendarEvent',
  })
  @IsNullable()
  closeDate: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Probability',
    description: 'Opportunity probability',
    icon: 'IconProgressCheck',
    defaultValue: { value: '0' },
  })
  @IsNullable()
  probability: string;

  // Relations
  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Pipeline Step',
    description: 'Opportunity pipeline step',
    icon: 'IconKanban',
    joinColumn: 'pipelineStepId',
  })
  @IsNullable()
  pipelineStep: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Point of Contact',
    description: 'Opportunity point of contact',
    icon: 'IconUser',
    joinColumn: 'pointOfContactId',
  })
  @IsNullable()
  pointOfContact: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Person',
    description: 'Opportunity person',
    icon: 'IconUser',
    joinColumn: 'personId',
  })
  person: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Company',
    description: 'Opportunity company',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
  })
  @IsNullable()
  company: string;
}
