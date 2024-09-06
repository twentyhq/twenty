import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { BEHAVIORAL_EVENT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.behavioralEvent,
  namePlural: 'behavioralEvents',
  labelSingular: 'Evento Comportamental',
  labelPlural: 'Eventos Comportamentais',
  description: 'Um evento relacionado ao comportamento do usuário',
  icon: 'IconIconTimelineEvent',
})
@WorkspaceIsSystem()
@WorkspaceGate({
  featureFlag: FeatureFlagKey.IsEventObjectEnabled,
})
export class BehavioralEventWorkspaceEntity extends BaseWorkspaceEntity {
  /** 
   * 
   * Common in Segment, Rudderstack, etc.
   * = Track, Screen, Page...
   * But doesn't feel that useful. 
   * Let's try living without it.
   * 
  @WorkspaceField({
    standardId: behavioralEventStandardFieldIds.type,
    type: FieldMetadataType.TEXT,
    label: 'Event type',
    description: 'Event type',
    icon: 'IconAbc',
  })
  type: string;
  */

  @WorkspaceField({
    standardId: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Nome do Evento',
    description: 'Nome do evento',
    icon: 'IconAbc',
  })
  name: string;

  @WorkspaceField({
    standardId: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS.properties,
    type: FieldMetadataType.RAW_JSON,
    label: 'Detalhes do Evento',
    description: 'Valor JSON para detalhes do evento',
    icon: 'IconListDetails',
  })
  @WorkspaceIsNullable()
  properties: JSON | null;

  @WorkspaceField({
    standardId: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS.context,
    type: FieldMetadataType.RAW_JSON,
    label: 'Contexto do Evento',
    description:
      'Objeto JSON para fornecer contexto (usuário, dispositivo, espaço de trabalho, etc.)',
    icon: 'IconListDetails',
  })
  @WorkspaceIsNullable()
  context: JSON | null;

  @WorkspaceField({
    standardId: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS.objectName,
    type: FieldMetadataType.TEXT,
    label: 'Nome do Objeto',
    description: 'Se o evento está relacionado a um objeto específico',
    icon: 'IconAbc',
  })
  objectName: string;

  @WorkspaceField({
    standardId: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS.recordId,
    type: FieldMetadataType.UUID,
    label: 'ID do Objeto',
    description: 'ID do objeto relacionado ao evento',
    icon: 'IconAbc',
  })
  @WorkspaceIsNullable()
  recordId: string | null;
}
