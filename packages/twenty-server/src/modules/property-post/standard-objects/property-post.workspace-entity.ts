import {
    type ActorMetadata,
    FieldMetadataType,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TITLE_FIELD_NAME = 'title';

export const SEARCH_FIELDS_FOR_PROPERTY_POST: FieldTypeAndNameMetadata[] = [
  { name: TITLE_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * PropertyPost Entity
 * AI-generated social media posts for properties
 * Just Listed, Just Sold, Open House, etc.
 */
export class PropertyPostWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  title: string;
  description: string | null;

  // Source
  sourceUrl: string; // MLS link or property page URL
  sourceType: string | null; // 'mls' | 'zillow' | 'realtor' | 'manual'

  // Post Type
  postType: string; // 'just_listed' | 'just_sold' | 'open_house' | 'price_change' | 'coming_soon' | 'closed'

  // Property Info (extracted or entered)
  propertyAddress: string | null;
  propertyCity: string | null;
  propertyState: string | null;
  propertyZip: string | null;
  propertyPrice: string | null;
  propertyBedrooms: number | null;
  propertyBathrooms: number | null;
  propertySquareFeet: number | null;
  propertyFeatures: string | null; // JSON array of features

  // Generated Content
  generatedTitle: string | null;
  generatedDescription: string | null;
  generatedHashtags: string | null; // JSON array
  generatedEmojis: string | null;

  // Images
  thumbnailUrl: string | null;
  mainImageUrl: string | null;
  additionalImages: string | null; // JSON array of image URLs

  // Output Formats
  embedHtml: string | null; // Iframe/embed code
  downloadImageUrl: string | null; // Generated image for download
  downloadImageWidth: number | null;
  downloadImageHeight: number | null;

  // Social Platform Specific
  instagramCaption: string | null;
  facebookPost: string | null;
  linkedinPost: string | null;
  twitterPost: string | null;

  // Template Used
  templateId: string | null;
  templateName: string | null;

  // AI Generation
  aiModel: string | null; // 'gpt-4' | 'claude' | etc.
  aiPrompt: string | null;
  aiGeneratedAt: Date | null;

  // Status
  status: string; // 'draft' | 'generated' | 'edited' | 'published'
  publishedAt: Date | null;
  publishedTo: string | null; // JSON array of platforms

  // Metadata
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  owner: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  ownerId: string | null;

  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;

  searchVector: string;
}
