import {
    type ActorMetadata,
    FieldMetadataType,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_PIPELINE_STAGE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * PipelineStage Entity
 * Customizable pipeline stages for different workflows
 */
export class PipelineStageWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  description: string | null;

  // Pipeline Configuration
  pipelineType: string; // 'deal' | 'transaction' | 'mortgage' | 'lead' | 'custom'

  // Visual
  color: string; // Hex color for the stage
  icon: string | null; // Icon name

  // Stage Settings
  stageType: string; // 'open' | 'won' | 'lost' | 'custom'
  isDefault: boolean; // Default stage for new items
  isFinal: boolean; // Final stage (won/lost)

  // Probability (for sales pipelines)
  probability: number | null; // 0-100

  // Automation Triggers
  triggerOnEnter: string | null; // JSON automation config
  triggerOnExit: string | null;

  // Requirements
  requiredFields: string | null; // JSON array of required fields to move to this stage
  requiredDocuments: string | null; // JSON array of required documents

  // Time Tracking
  expectedDuration: number | null; // Expected days in this stage

  // Ordering
  position: number;

  // Status
  isActive: boolean;

  // Metadata
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;

  searchVector: string;
}
