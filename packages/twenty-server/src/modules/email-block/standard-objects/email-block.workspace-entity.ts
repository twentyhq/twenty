/**
 * Email Block Entity
 * Reusable email blocks for the newsletter/email builder
 * These are the building blocks that admins create
 */

import {
    type ActorMetadata,
    FieldMetadataType,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_EMAIL_BLOCK: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class EmailBlockWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  description: string | null;

  // Block Type
  blockType: string; // 'header' | 'footer' | 'text' | 'image' | 'button' | 'property_card' | 'social' | 'html' | etc.
  category: string; // 'layout' | 'content' | 'real_estate' | 'social' | 'dynamic' | 'advanced'

  // Content
  htmlContent: string; // The HTML template with placeholders
  cssStyles: string | null; // CSS styles
  previewHtml: string | null; // Preview with sample data

  // Block Settings (JSON)
  defaultSettings: string | null; // Default settings for the block
  editableFields: string | null; // Which fields users can edit

  // Preview
  thumbnailUrl: string | null;
  previewImageUrl: string | null;

  // Usage
  isBuiltIn: boolean; // System-provided block
  isActive: boolean;
  usageCount: number;

  // Admin Only
  isAdminOnly: boolean;

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
 * Built-in Email Blocks with HTML Templates
 */
export const BUILT_IN_EMAIL_BLOCKS = [
  // ==================== LAYOUT BLOCKS ====================
  {
    name: 'Email Header',
    blockType: 'header',
    category: 'layout',
    htmlContent: `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: {{backgroundColor}};">
  <tr>
    <td align="center" style="padding: 20px;">
      <img src="{{logoUrl}}" alt="{{companyName}}" style="max-height: 60px; width: auto;" />
    </td>
  </tr>
</table>`,
    defaultSettings: JSON.stringify({
      backgroundColor: '#ffffff',
      logoUrl: '',
      companyName: 'Company Name',
    }),
  },

  {
    name: 'Email Footer',
    blockType: 'footer',
    category: 'layout',
    htmlContent: `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: {{backgroundColor}}; padding: 30px;">
  <tr>
    <td align="center">
      <p style="color: {{textColor}}; font-size: 14px; margin: 0;">
        {{companyName}}<br/>
        {{address}}<br/>
        {{phone}} | {{email}}
      </p>
      <p style="color: {{textColor}}; font-size: 12px; margin-top: 15px;">
        <a href="{{unsubscribeUrl}}" style="color: {{linkColor}};">Unsubscribe</a> |
        <a href="{{preferencesUrl}}" style="color: {{linkColor}};">Email Preferences</a>
      </p>
      <div style="margin-top: 15px;">
        {{#if facebookUrl}}<a href="{{facebookUrl}}"><img src="https://cdn.example.com/icons/facebook.png" width="24" /></a>{{/if}}
        {{#if instagramUrl}}<a href="{{instagramUrl}}"><img src="https://cdn.example.com/icons/instagram.png" width="24" /></a>{{/if}}
        {{#if linkedinUrl}}<a href="{{linkedinUrl}}"><img src="https://cdn.example.com/icons/linkedin.png" width="24" /></a>{{/if}}
      </div>
    </td>
  </tr>
</table>`,
    defaultSettings: JSON.stringify({
      backgroundColor: '#f5f5f5',
      textColor: '#666666',
      linkColor: '#0066cc',
    }),
  },

  {
    name: 'Divider',
    blockType: 'divider',
    category: 'layout',
    htmlContent: `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding: {{padding}}px 0;">
      <hr style="border: none; border-top: {{thickness}}px {{style}} {{color}}; margin: 0;" />
    </td>
  </tr>
</table>`,
    defaultSettings: JSON.stringify({
      padding: 20,
      thickness: 1,
      style: 'solid',
      color: '#e0e0e0',
    }),
  },

  {
    name: 'Spacer',
    blockType: 'spacer',
    category: 'layout',
    htmlContent: `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="height: {{height}}px;"></td>
  </tr>
</table>`,
    defaultSettings: JSON.stringify({ height: 30 }),
  },

  {
    name: '2 Columns',
    blockType: 'columns_2',
    category: 'layout',
    htmlContent: `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="50%" valign="top" style="padding: 10px;">
      {{column1Content}}
    </td>
    <td width="50%" valign="top" style="padding: 10px;">
      {{column2Content}}
    </td>
  </tr>
</table>`,
    defaultSettings: JSON.stringify({
      column1Content: 'Column 1',
      column2Content: 'Column 2',
    }),
  },

  // ==================== CONTENT BLOCKS ====================
  {
    name: 'Text Block',
    blockType: 'text',
    category: 'content',
    htmlContent: `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding: {{padding}}px; font-family: {{fontFamily}}; font-size: {{fontSize}}px; color: {{textColor}}; line-height: {{lineHeight}};">
      {{content}}
    </td>
  </tr>
</table>`,
    defaultSettings: JSON.stringify({
      padding: 20,
      fontFamily: 'Arial, sans-serif',
      fontSize: 16,
      textColor: '#333333',
      lineHeight: 1.5,
      content: 'Enter your text here...',
    }),
  },

  {
    name: 'Heading',
    blockType: 'heading',
    category: 'content',
    htmlContent: `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding: {{padding}}px;">
      <{{tag}} style="font-family: {{fontFamily}}; font-size: {{fontSize}}px; color: {{textColor}}; margin: 0; font-weight: {{fontWeight}};">
        {{content}}
      </{{tag}}>
    </td>
  </tr>
</table>`,
    defaultSettings: JSON.stringify({
      tag: 'h1',
      padding: 20,
      fontFamily: 'Arial, sans-serif',
      fontSize: 28,
      textColor: '#333333',
      fontWeight: 'bold',
      content: 'Your Heading',
    }),
  },

  {
    name: 'Image',
    blockType: 'image',
    category: 'content',
    htmlContent: `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="{{align}}" style="padding: {{padding}}px;">
      {{#if linkUrl}}<a href="{{linkUrl}}">{{/if}}
        <img src="{{imageUrl}}" alt="{{altText}}" style="max-width: {{maxWidth}}%; height: auto; border-radius: {{borderRadius}}px;" />
      {{#if linkUrl}}</a>{{/if}}
      {{#if caption}}<p style="font-size: 14px; color: #666; margin-top: 10px;">{{caption}}</p>{{/if}}
    </td>
  </tr>
</table>`,
    defaultSettings: JSON.stringify({
      imageUrl: '',
      altText: 'Image',
      linkUrl: '',
      caption: '',
      align: 'center',
      maxWidth: 100,
      padding: 20,
      borderRadius: 0,
    }),
  },

  {
    name: 'Button',
    blockType: 'button',
    category: 'content',
    htmlContent: `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="{{align}}" style="padding: {{padding}}px;">
      <a href="{{linkUrl}}" style="
        display: inline-block;
        background-color: {{backgroundColor}};
        color: {{textColor}};
        font-family: {{fontFamily}};
        font-size: {{fontSize}}px;
        font-weight: {{fontWeight}};
        padding: {{paddingY}}px {{paddingX}}px;
        text-decoration: none;
        border-radius: {{borderRadius}}px;
        border: {{borderWidth}}px solid {{borderColor}};
      ">
        {{buttonText}}
      </a>
    </td>
  </tr>
</table>`,
    defaultSettings: JSON.stringify({
      buttonText: 'Click Here',
      linkUrl: '#',
      backgroundColor: '#0066cc',
      textColor: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: 16,
      fontWeight: 'bold',
      paddingX: 30,
      paddingY: 15,
      borderRadius: 5,
      borderWidth: 0,
      borderColor: '#0066cc',
      align: 'center',
      padding: 20,
    }),
  },

  // ==================== REAL ESTATE BLOCKS ====================
  {
    name: 'Property Card',
    blockType: 'property_card',
    category: 'real_estate',
    htmlContent: `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: {{backgroundColor}}; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
  <tr>
    <td>
      <img src="{{imageUrl}}" alt="{{address}}" style="width: 100%; height: 250px; object-fit: cover;" />
    </td>
  </tr>
  <tr>
    <td style="padding: 20px;">
      <p style="font-size: 24px; font-weight: bold; color: {{priceColor}}; margin: 0 0 10px 0;">{{price}}</p>
      <p style="font-size: 18px; color: {{textColor}}; margin: 0 0 5px 0;">{{address}}</p>
      <p style="font-size: 14px; color: #666; margin: 0 0 15px 0;">{{city}}, {{state}} {{zip}}</p>
      <p style="font-size: 14px; color: {{textColor}}; margin: 0;">
        🛏 {{bedrooms}} Beds &nbsp;&nbsp; 🛁 {{bathrooms}} Baths &nbsp;&nbsp; 📐 {{squareFeet}} Sq Ft
      </p>
      {{#if ctaUrl}}
      <a href="{{ctaUrl}}" style="
        display: inline-block;
        background-color: {{ctaColor}};
        color: #ffffff;
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 15px;
        font-weight: bold;
      ">{{ctaText}}</a>
      {{/if}}
    </td>
  </tr>
</table>`,
    defaultSettings: JSON.stringify({
      imageUrl: '',
      address: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      price: '$450,000',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: '1,800',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      priceColor: '#0066cc',
      ctaUrl: '',
      ctaText: 'View Property',
      ctaColor: '#0066cc',
    }),
  },

  {
    name: 'Just Listed Banner',
    blockType: 'just_listed',
    category: 'real_estate',
    htmlContent: `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, {{gradientStart}}, {{gradientEnd}}); border-radius: 10px; overflow: hidden;">
  <tr>
    <td style="padding: 30px; text-align: center;">
      <p style="font-size: 14px; color: #ffffff; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 10px 0;">🏠 Just Listed</p>
      <p style="font-size: 32px; font-weight: bold; color: #ffffff; margin: 0 0 15px 0;">{{price}}</p>
      <p style="font-size: 20px; color: #ffffff; margin: 0 0 5px 0;">{{address}}</p>
      <p style="font-size: 16px; color: rgba(255,255,255,0.9); margin: 0 0 20px 0;">{{city}}, {{state}}</p>
      <p style="font-size: 16px; color: #ffffff; margin: 0;">
        {{bedrooms}} Beds • {{bathrooms}} Baths • {{squareFeet}} Sq Ft
      </p>
    </td>
  </tr>
  {{#if imageUrl}}
  <tr>
    <td>
      <img src="{{imageUrl}}" alt="{{address}}" style="width: 100%; height: auto;" />
    </td>
  </tr>
  {{/if}}
</table>`,
    defaultSettings: JSON.stringify({
      gradientStart: '#667eea',
      gradientEnd: '#764ba2',
      price: '$450,000',
      address: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: '1,800',
      imageUrl: '',
    }),
  },

  {
    name: 'Just Sold Banner',
    blockType: 'just_sold',
    category: 'real_estate',
    htmlContent: `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, {{gradientStart}}, {{gradientEnd}}); border-radius: 10px; overflow: hidden;">
  <tr>
    <td style="padding: 30px; text-align: center;">
      <p style="font-size: 14px; color: #ffffff; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 10px 0;">🎉 Just Sold</p>
      <p style="font-size: 32px; font-weight: bold; color: #ffffff; margin: 0 0 15px 0;">{{soldPrice}}</p>
      <p style="font-size: 20px; color: #ffffff; margin: 0 0 5px 0;">{{address}}</p>
      <p style="font-size: 16px; color: rgba(255,255,255,0.9); margin: 0 0 20px 0;">{{city}}, {{state}}</p>
      {{#if daysOnMarket}}
      <p style="font-size: 14px; color: rgba(255,255,255,0.8); margin: 0;">
        Sold in {{daysOnMarket}} days!
      </p>
      {{/if}}
    </td>
  </tr>
  {{#if imageUrl}}
  <tr>
    <td>
      <img src="{{imageUrl}}" alt="{{address}}" style="width: 100%; height: auto;" />
    </td>
  </tr>
  {{/if}}
</table>`,
    defaultSettings: JSON.stringify({
      gradientStart: '#11998e',
      gradientEnd: '#38ef7d',
      soldPrice: '$465,000',
      address: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      daysOnMarket: 14,
      imageUrl: '',
    }),
  },

  {
    name: 'Open House Banner',
    blockType: 'open_house',
    category: 'real_estate',
    htmlContent: `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, {{gradientStart}}, {{gradientEnd}}); border-radius: 10px; overflow: hidden;">
  <tr>
    <td style="padding: 30px; text-align: center;">
      <p style="font-size: 14px; color: #ffffff; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 10px 0;">🏡 Open House</p>
      <p style="font-size: 28px; font-weight: bold; color: #ffffff; margin: 0 0 10px 0;">{{date}}</p>
      <p style="font-size: 22px; color: #ffffff; margin: 0 0 20px 0;">{{timeStart}} - {{timeEnd}}</p>
      <p style="font-size: 18px; color: #ffffff; margin: 0 0 5px 0;">{{address}}</p>
      <p style="font-size: 16px; color: rgba(255,255,255,0.9); margin: 0 0 15px 0;">{{city}}, {{state}}</p>
      <p style="font-size: 24px; font-weight: bold; color: #ffffff; margin: 0;">{{price}}</p>
    </td>
  </tr>
  {{#if imageUrl}}
  <tr>
    <td>
      <img src="{{imageUrl}}" alt="{{address}}" style="width: 100%; height: auto;" />
    </td>
  </tr>
  {{/if}}
</table>`,
    defaultSettings: JSON.stringify({
      gradientStart: '#f093fb',
      gradientEnd: '#f5576c',
      date: 'Saturday, January 25',
      timeStart: '1:00 PM',
      timeEnd: '4:00 PM',
      address: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      price: '$450,000',
      imageUrl: '',
    }),
  },

  // ==================== SOCIAL BLOCKS ====================
  {
    name: 'Social Links',
    blockType: 'social_links',
    category: 'social',
    htmlContent: `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding: {{padding}}px;">
      {{#if facebookUrl}}<a href="{{facebookUrl}}" style="margin: 0 8px;"><img src="https://cdn.example.com/icons/facebook-{{iconStyle}}.png" width="{{iconSize}}" alt="Facebook" /></a>{{/if}}
      {{#if instagramUrl}}<a href="{{instagramUrl}}" style="margin: 0 8px;"><img src="https://cdn.example.com/icons/instagram-{{iconStyle}}.png" width="{{iconSize}}" alt="Instagram" /></a>{{/if}}
      {{#if linkedinUrl}}<a href="{{linkedinUrl}}" style="margin: 0 8px;"><img src="https://cdn.example.com/icons/linkedin-{{iconStyle}}.png" width="{{iconSize}}" alt="LinkedIn" /></a>{{/if}}
      {{#if twitterUrl}}<a href="{{twitterUrl}}" style="margin: 0 8px;"><img src="https://cdn.example.com/icons/twitter-{{iconStyle}}.png" width="{{iconSize}}" alt="Twitter" /></a>{{/if}}
      {{#if youtubeUrl}}<a href="{{youtubeUrl}}" style="margin: 0 8px;"><img src="https://cdn.example.com/icons/youtube-{{iconStyle}}.png" width="{{iconSize}}" alt="YouTube" /></a>{{/if}}
    </td>
  </tr>
</table>`,
    defaultSettings: JSON.stringify({
      facebookUrl: '',
      instagramUrl: '',
      linkedinUrl: '',
      twitterUrl: '',
      youtubeUrl: '',
      iconStyle: 'color', // 'color' | 'dark' | 'light'
      iconSize: 32,
      padding: 20,
    }),
  },

  // ==================== ADVANCED BLOCKS ====================
  {
    name: 'Custom HTML',
    blockType: 'html',
    category: 'advanced',
    htmlContent: `{{customHtml}}`,
    defaultSettings: JSON.stringify({
      customHtml:
        '<!-- Enter your custom HTML here -->\n<div style="padding: 20px;">\n  Your content\n</div>',
    }),
  },
];
