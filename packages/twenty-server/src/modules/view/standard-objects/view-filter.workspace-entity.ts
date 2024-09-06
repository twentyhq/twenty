import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { VIEW_FILTER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.viewFilter,
  namePlural: 'viewFilters',
  labelSingular: 'Filtro de Visualização',
  labelPlural: 'Filtros de Visualização',
  description: '(Sistema) Filtros de Visualização',
  icon: 'IconFilterBolt',
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class ViewFilterWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.fieldMetadataId,
    type: FieldMetadataType.UUID,
    label: 'ID de Metadados do Campo',
    description: 'Campo alvo do filtro de visualização',
  })
  fieldMetadataId: string;

  @WorkspaceField({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.operand,
    type: FieldMetadataType.TEXT,
    label: 'Operador',
    description: 'Operador do filtro de visualização',
    defaultValue: "'Contains'",
  })
  operand: string;

  @WorkspaceField({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.value,
    type: FieldMetadataType.TEXT,
    label: 'Valor',
    description: 'Valor do filtro de visualização',
  })
  value: string;

  @WorkspaceField({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.displayValue,
    type: FieldMetadataType.TEXT,
    label: 'Valor de Exibição',
    description: 'Valor de exibição do filtro de visualização',
  })
  displayValue: string;

  @WorkspaceRelation({
    standardId: VIEW_FILTER_STANDARD_FIELD_IDS.view,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Visualização',
    description: 'Visualização relacionada ao filtro de visualização',
    icon: 'IconLayoutCollage',
    inverseSideTarget: () => ViewWorkspaceEntity,
    inverseSideFieldKey: 'viewFilters',
  })
  @WorkspaceIsNullable()
  view: Relation<ViewWorkspaceEntity> | null;

  @WorkspaceJoinColumn('view')
  viewId: string | null;
}
