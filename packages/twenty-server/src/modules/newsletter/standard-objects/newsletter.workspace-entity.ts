import {
  type ActorMetadata,
  FieldMetadataType,
  type RichTextV2Metadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_NEWSLETTER: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * Newsletter Entity
 * Email newsletters created with the block-based HTML editor
 */
export class NewsletterWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  subject: string;
  preheaderText: string | null;

  // Content (Block-based)
  contentBlocks: string; // JSON array of blocks (see EMAIL_BLOCKS below)
  contentHtml: string | null; // Compiled HTML output
  contentText: string | null; // Plain text version

  // Template Settings
  isTemplate: boolean;
  templateCategory: string | null;

  // Status
  status: string; // 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'

  // Audience
  audienceType: string; // 'all' | 'segment' | 'list' | 'manual'
  audienceFilter: string | null; // JSON filter
  recipientCount: number;

  // Schedule
  scheduledAt: Date | null;
  sentAt: Date | null;
  completedAt: Date | null;

  // Analytics
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;

  // Rates
  openRate: number | null;
  clickRate: number | null;

  // Design Settings
  backgroundColor: string | null;
  fontFamily: string | null;
  headerImageUrl: string | null;
  footerHtml: string | null;

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

/**
 * Email Block Types for the Newsletter Builder
 * Each block type has specific properties and renders to HTML
 */
export const EMAIL_BLOCK_TYPES = [
  // Layout Blocks
  {
    type: 'header',
    name: 'Header',
    category: 'layout',
    description: 'Email header with logo and navigation',
  },
  {
    type: 'footer',
    name: 'Footer',
    category: 'layout',
    description: 'Email footer with social links and unsubscribe',
  },
  {
    type: 'divider',
    name: 'Divider',
    category: 'layout',
    description: 'Horizontal divider line',
  },
  {
    type: 'spacer',
    name: 'Spacer',
    category: 'layout',
    description: 'Vertical spacing',
  },
  {
    type: 'columns_2',
    name: '2 Columns',
    category: 'layout',
    description: 'Two column layout',
  },
  {
    type: 'columns_3',
    name: '3 Columns',
    category: 'layout',
    description: 'Three column layout',
  },

  // Content Blocks
  {
    type: 'text',
    name: 'Text',
    category: 'content',
    description: 'Rich text content',
  },
  {
    type: 'heading',
    name: 'Heading',
    category: 'content',
    description: 'Heading text (H1, H2, H3)',
  },
  {
    type: 'paragraph',
    name: 'Paragraph',
    category: 'content',
    description: 'Paragraph text',
  },
  {
    type: 'image',
    name: 'Image',
    category: 'content',
    description: 'Image with optional link',
  },
  {
    type: 'button',
    name: 'Button',
    category: 'content',
    description: 'Call-to-action button',
  },
  {
    type: 'video',
    name: 'Video',
    category: 'content',
    description: 'Video thumbnail with play button',
  },

  // Property Blocks (Real Estate Specific)
  {
    type: 'property_card',
    name: 'Property Card',
    category: 'real_estate',
    description: 'Property listing card with image and details',
  },
  {
    type: 'property_grid',
    name: 'Property Grid',
    category: 'real_estate',
    description: 'Grid of multiple properties',
  },
  {
    type: 'just_listed',
    name: 'Just Listed',
    category: 'real_estate',
    description: 'Just Listed announcement',
  },
  {
    type: 'just_sold',
    name: 'Just Sold',
    category: 'real_estate',
    description: 'Just Sold announcement',
  },
  {
    type: 'open_house',
    name: 'Open House',
    category: 'real_estate',
    description: 'Open House announcement',
  },
  {
    type: 'price_reduction',
    name: 'Price Reduction',
    category: 'real_estate',
    description: 'Price Reduction announcement',
  },

  // Social Blocks
  {
    type: 'social_links',
    name: 'Social Links',
    category: 'social',
    description: 'Social media icons',
  },
  {
    type: 'share_buttons',
    name: 'Share Buttons',
    category: 'social',
    description: 'Share to social media buttons',
  },

  // Dynamic Blocks
  {
    type: 'merge_field',
    name: 'Merge Field',
    category: 'dynamic',
    description: 'Dynamic merge field (name, etc.)',
  },
  {
    type: 'conditional',
    name: 'Conditional',
    category: 'dynamic',
    description: 'Show content conditionally',
  },

  // HTML Blocks
  {
    type: 'html',
    name: 'Custom HTML',
    category: 'advanced',
    description: 'Raw HTML code',
  },
  {
    type: 'code',
    name: 'Code Block',
    category: 'advanced',
    description: 'Code snippet',
  },
];
