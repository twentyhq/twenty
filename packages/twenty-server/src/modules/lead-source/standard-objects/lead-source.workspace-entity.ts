import {
    type ActorMetadata,
    type CurrencyMetadata,
    FieldMetadataType,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_LEAD_SOURCE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * LeadSource Entity
 * Tracks where leads come from for marketing analytics
 */
export class LeadSourceWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  description: string | null;

  // Source Details
  sourceType: string; // 'website' | 'referral' | 'social' | 'paid_ads' | 'organic' | 'event' | 'cold_call' | 'other'
  channel: string | null; // 'google' | 'facebook' | 'instagram' | 'zillow' | 'realtor.com' | etc.

  // Tracking
  trackingCode: string | null; // UTM or custom tracking code

  // Status
  isActive: boolean;

  // Analytics
  leadsCount: number;
  convertedCount: number;
  conversionRate: number | null;

  // Cost Tracking
  totalSpend: CurrencyMetadata | null;
  costPerLead: CurrencyMetadata | null;
  costPerConversion: CurrencyMetadata | null;

  // Revenue Attribution
  totalRevenue: CurrencyMetadata | null;
  roi: number | null; // Return on investment percentage

  // Metadata
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;

  searchVector: string;
}
