import { OneToMany, Relation } from 'typeorm';

import { FieldMetadataType } from 'twenty-shared';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { INTEGRATION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { FieldTypeAndNameMetadata, getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_INTEGRATION: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.integration,
  namePlural: 'integrations',
  labelSingular: 'Integration',
  labelPlural: 'Integrations',
  description: 'A integration',
  icon: 'IconFileImport',
  labelIdentifierStandardId: INTEGRATION_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsNotAuditLogged()
export class IntegrationWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: INTEGRATION_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'Integration name',
    icon: 'IconFileUpload',
  })
  @WorkspaceIsNullable()
  name: string;

  @WorkspaceField({
    standardId: INTEGRATION_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Position',
    description: 'Integration record position',
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  @WorkspaceRelation({
    standardId: INTEGRATION_STANDARD_FIELD_IDS.charge,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Charge',
    description: 'Integration linked to the charge',
    icon: 'IconPhone',
    inverseSideTarget: () => ChargeWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  @OneToMany(() => ChargeWorkspaceEntity, (charge) => charge.integration, {
    nullable: true,
  })
  charges: ChargeWorkspaceEntity[];

  @WorkspaceRelation({
    standardId: INTEGRATION_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Events',
    description: 'Events linked to the integration',
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: INTEGRATION_STANDARD_FIELD_IDS.attachments,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Attachments',
    description: 'Attachments linked to the integration',
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: INTEGRATION_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
        SEARCH_FIELDS_FOR_INTEGRATION
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  [SEARCH_VECTOR_FIELD.name]: any;
}
