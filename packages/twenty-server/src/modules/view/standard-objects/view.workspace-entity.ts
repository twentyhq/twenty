import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
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
import { VIEW_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';
import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';
import { ViewSortWorkspaceEntity } from 'src/modules/view/standard-objects/view-sort.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.view,
  namePlural: 'views',
  labelSingular: 'Visualização',
  labelPlural: 'Visualizações',
  description: '(Sistema) Visualizações',
  icon: 'IconLayoutCollage',
  labelIdentifierStandardId: VIEW_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class ViewWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Nome',
    description: 'Nome da visualização',
  })
  name: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.objectMetadataId,
    type: FieldMetadataType.UUID,
    label: 'ID do Metadado do Objeto',
    description: 'Objeto alvo da visualização',
  })
  objectMetadataId: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.TEXT,
    label: 'Tipo',
    description: 'Tipo da visualização',
    defaultValue: "'table'",
  })
  type: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.key,
    type: FieldMetadataType.SELECT,
    label: 'Chave',
    description: 'Chave da visualização',
    options: [{ value: 'INDEX', label: 'Índice', position: 0, color: 'red' }],
    defaultValue: "'INDEX'",
  })
  @WorkspaceIsNullable()
  key: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.icon,
    type: FieldMetadataType.TEXT,
    label: 'Ícone',
    description: 'Ícone da visualização',
  })
  icon: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.kanbanFieldMetadataId,
    type: FieldMetadataType.TEXT,
    label: 'kanbanfieldMetadataId',
    description: 'Campo da coluna Kanban da visualização',
  })
  kanbanFieldMetadataId: string;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Posição',
    description: 'Posição da visualização',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: VIEW_STANDARD_FIELD_IDS.isCompact,
    type: FieldMetadataType.BOOLEAN,
    label: 'Visualização Compacta',
    description: 'Descreve se a visualização está no modo compacto',
    defaultValue: false,
  })
  isCompact: boolean;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewFields,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Campos da Visualização',
    description: 'Campos da visualização',
    icon: 'IconTag',
    inverseSideTarget: () => ViewFieldWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  viewFields: Relation<ViewFieldWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewFilters,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Filtros da Visualização',
    description: 'Filtros da visualização',
    icon: 'IconFilterBolt',
    inverseSideTarget: () => ViewFilterWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  viewFilters: Relation<ViewFilterWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.viewSorts,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Ordenações da Visualização',
    description: 'Ordenações da visualização',
    icon: 'IconArrowsSort',
    inverseSideTarget: () => ViewSortWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  viewSorts: Relation<ViewSortWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: VIEW_STANDARD_FIELD_IDS.favorites,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Favoritos',
    description: 'Favoritos vinculados à visualização',
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;
}
