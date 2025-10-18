# View Group Test Utilities - SDK-Powered

This directory contains type-safe test utilities for view groups, powered by the Twenty SDK.

## 🎯 Improved Developer Experience

### Before (Old Approach)

```typescript
// Manual typing, casting, and error handling
const result = await createOneCoreViewGroup({
  input: {
    fieldMetadataId: 'field-id',
    fieldValue: 'value',
    viewId: 'view-id',
  },
  gqlFields: VIEW_GROUP_GQL_FIELDS, // Manual field selection
  expectToFail: false,
});

// Need to check for errors manually
if (result.errors?.length) {
  // handle errors
}

// Type is loosely defined
const viewGroup = result.data.createCoreViewGroup as ViewGroupEntity;
```

### After (SDK Approach)

```typescript
// Full type inference - no casting needed!
const viewGroup = await createOneCoreViewGroup({
  input: {
    fieldMetadataId: 'field-id',
    fieldValue: 'value',
    viewId: 'view-id',
  },
});

// TypeScript knows EXACTLY what fields are available
console.log(
  viewGroup.id,           // ✅ string
  viewGroup.fieldValue,   // ✅ string
  viewGroup.position,     // ✅ number
  viewGroup.createdAt     // ✅ Date
);

// Error handling with try/catch
try {
  const viewGroup = await createOneCoreViewGroup({ input: {...} });
} catch (error) {
  // Natural error handling
}
```

## ✨ Key Benefits

### 1. **Full Type Inference**

No more manual type casting or `as` assertions:

```typescript
const viewGroup = await createOneCoreViewGroup({ input: {...} });

// TypeScript infers the exact type from the SDK mutation!
// Type: {
//   id: string;
//   fieldMetadataId: string;
//   fieldValue: string;
//   isVisible: boolean;
//   position: number;
//   viewId: string;
//   createdAt: Date;
//   updatedAt: Date;
//   deletedAt: Date | null;
// }
```

### 2. **Auto-Completion Everywhere**

```typescript
const viewGroup = await createOneCoreViewGroup({ input: {...} });

viewGroup. // <- IDE shows all available fields with correct types!
```

### 3. **Type-Safe Field Selection**

No more string-based `gqlFields`:

```typescript
// Before: String-based, error-prone
gqlFields: `
  id
  fieldMetadataId
  fieldValue
`

// After: Type-safe object
const VIEW_GROUP_FIELDS = {
  id: true,
  fieldMetadataId: true,
  fieldValue: true,
  // TypeScript validates these are real fields!
} as const;
```

### 4. **Reusable Type Helper**

```typescript
import { type CreateViewGroupResult } from './create-one-core-view-group.util';

// Use the inferred type elsewhere
function processViewGroup(viewGroup: CreateViewGroupResult) {
  // Full type safety!
  return viewGroup.fieldValue.toUpperCase();
}
```

## 📚 Usage Examples

### Basic Usage

```typescript
import { createOneCoreViewGroup } from './utils/create-one-core-view-group.util';

describe('View Groups', () => {
  it('should create a view group', async () => {
    const viewGroup = await createOneCoreViewGroup({
      input: {
        fieldMetadataId: 'field-123',
        fieldValue: 'active',
        viewId: 'view-456',
        position: 0,
        isVisible: true,
      },
    });

    // Full type safety - no assertions needed!
    expect(viewGroup.id).toBeDefined();
    expect(viewGroup.fieldValue).toBe('active');
    expect(viewGroup.position).toBe(0);
  });
});
```

### Error Handling

```typescript
it('should handle errors gracefully', async () => {
  await expect(
    createOneCoreViewGroup({
      input: {
        fieldMetadataId: 'invalid-id',
        fieldValue: 'value',
        viewId: 'view-id',
      },
    })
  ).rejects.toThrow();
});
```

### Using the Type Helper

```typescript
import { type CreateViewGroupResult } from './utils/create-one-core-view-group.util';

const processViewGroups = (
  viewGroups: CreateViewGroupResult[]
): string[] => {
  // Full type inference!
  return viewGroups.map(vg => vg.fieldValue);
};
```

## 🔧 Implementation Details

The utility:

1. **Uses the Twenty SDK** for type-safe mutations
2. **Infers types** from the SDK call itself
3. **Maintains backward compatibility** with deprecated parameters
4. **Provides reusable field selections** via `VIEW_GROUP_FIELDS`
5. **Exports type helper** for reuse across tests

## 🚀 Migration Guide

To migrate existing tests:

```typescript
// Old
const result = await createOneCoreViewGroup({
  input: {...},
  gqlFields: VIEW_GROUP_GQL_FIELDS,
  expectToFail: false,
});
const viewGroup = result.data.createCoreViewGroup;

// New (both work, but new style is better)
const viewGroup = await createOneCoreViewGroup({
  input: {...}
});
```

The `expectToFail` and `gqlFields` parameters still work but are deprecated.

## 🎨 Pattern to Follow

This pattern can be applied to all metadata test utilities:

1. ✅ Use SDK for mutations/queries
2. ✅ Let TypeScript infer types
3. ✅ Define reusable field selections
4. ✅ Export type helpers
5. ✅ Keep backward compatibility where needed

