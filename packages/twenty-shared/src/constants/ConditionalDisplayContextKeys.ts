import { CONDITIONAL_DISPLAY_DEVICES } from '@/constants/ConditionalDisplayDevices';
import { type ConditionalDisplayAdminContextKey } from '@/types/conditional-display/ConditionalDisplayAdminContextKey';
import { type ConditionalDisplayContextKeyDefinition } from '@/types/conditional-display/ConditionalDisplayContextKeyDefinition';
import { type ConditionalDisplayEngineContextKey } from '@/types/conditional-display/internal/ConditionalDisplayEngineContextKey';
import { ContextStorePageType } from '@/types/ContextStorePageType';
import { FieldMetadataType } from '@/types/FieldMetadataType';

export const CONDITIONAL_DISPLAY_CONTEXT_KEYS: Record<
  ConditionalDisplayAdminContextKey,
  Extract<ConditionalDisplayContextKeyDefinition, { owner: 'admin' }>
> &
  Record<
    ConditionalDisplayEngineContextKey,
    Extract<ConditionalDisplayContextKeyDefinition, { owner: 'engine' }>
  > = {
  currentRoleId: {
    owner: 'admin',
    subject: { kind: 'value', field: { type: FieldMetadataType.SELECT } },
  },
  currentWorkspaceMemberId: {
    owner: 'admin',
    subject: { kind: 'value', field: { type: FieldMetadataType.RELATION } },
  },
  device: {
    owner: 'admin',
    subject: {
      kind: 'value',
      field: {
        type: FieldMetadataType.SELECT,
        options: CONDITIONAL_DISPLAY_DEVICES,
      },
    },
  },
  pageType: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: {
      kind: 'value',
      field: {
        type: FieldMetadataType.SELECT,
        options: Object.values(ContextStorePageType),
      },
    },
  },
  isInSidePanel: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: { kind: 'value', field: { type: FieldMetadataType.BOOLEAN } },
  },
  isDashboardPageLayoutInEditMode: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: { kind: 'value', field: { type: FieldMetadataType.BOOLEAN } },
  },
  isLayoutCustomizationModeEnabled: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: { kind: 'value', field: { type: FieldMetadataType.BOOLEAN } },
  },
  areAllSelectedRecordsFavorites: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: { kind: 'value', field: { type: FieldMetadataType.BOOLEAN } },
  },
  isSelectAll: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: { kind: 'value', field: { type: FieldMetadataType.BOOLEAN } },
  },
  hasAnySoftDeleteFilterOnView: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: { kind: 'value', field: { type: FieldMetadataType.BOOLEAN } },
  },
  numberOfSelectedRecords: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: { kind: 'value', field: { type: FieldMetadataType.NUMBER } },
  },
  objectPermissions: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: {
      kind: 'mapEntry',
      entryField: { type: FieldMetadataType.BOOLEAN },
    },
  },
  selectedRecords: {
    owner: 'engine',
    surfaces: ['commandMenuItem', 'pageLayoutWidget'],
    subject: { kind: 'selectedRecordPath' },
  },
  featureFlags: {
    owner: 'engine',
    surfaces: ['commandMenuItem', 'pageLayoutWidget'],
    subject: {
      kind: 'mapEntry',
      entryField: { type: FieldMetadataType.BOOLEAN },
    },
  },
  permissionFlags: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: {
      kind: 'mapEntry',
      entryField: { type: FieldMetadataType.BOOLEAN },
    },
  },
  targetObjectReadPermissions: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: {
      kind: 'mapEntry',
      entryField: { type: FieldMetadataType.BOOLEAN },
    },
  },
  targetObjectWritePermissions: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: {
      kind: 'mapEntry',
      entryField: { type: FieldMetadataType.BOOLEAN },
    },
  },
  canImpersonate: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: { kind: 'value', field: { type: FieldMetadataType.BOOLEAN } },
  },
  canAccessFullAdminPanel: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: { kind: 'value', field: { type: FieldMetadataType.BOOLEAN } },
  },
  objectMetadataItem: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: {
      kind: 'property',
      propertyFields: {
        nameSingular: { type: FieldMetadataType.SELECT },
        isRemote: { type: FieldMetadataType.BOOLEAN },
        isSystem: { type: FieldMetadataType.BOOLEAN },
        isUICreatable: { type: FieldMetadataType.BOOLEAN },
        isUIEditable: { type: FieldMetadataType.BOOLEAN },
        duplicateCriteria: { type: FieldMetadataType.RAW_JSON },
      },
    },
  },
  objectMetadataLabel: {
    owner: 'engine',
    surfaces: ['commandMenuItem'],
    subject: { kind: 'value', field: { type: FieldMetadataType.TEXT } },
  },
};
