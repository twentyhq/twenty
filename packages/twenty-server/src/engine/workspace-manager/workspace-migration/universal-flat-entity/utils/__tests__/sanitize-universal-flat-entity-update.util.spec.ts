import { type AllMetadataName } from 'twenty-shared/metadata';

import { sanitizeUniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/sanitize-universal-flat-entity-update.util';

describe('sanitizeFlatEntityUpdate', () => {
  it('should return only valid properties for fieldMetadata when update contains valid and invalid properties', () => {
    const result = sanitizeUniversalFlatEntityUpdate({
      flatEntityUpdate: {
        isActive: true,
        label: 'New Label',
        invalidProperty: 'should be removed',
      } as any,
      metadataName: 'fieldMetadata' as AllMetadataName,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return empty object when all properties are undefined for fieldMetadata', () => {
    const result = sanitizeUniversalFlatEntityUpdate({
      flatEntityUpdate: {
        isActive: undefined,
        label: undefined,
      } as any,
      metadataName: 'fieldMetadata' as AllMetadataName,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return empty object when update is empty for fieldMetadata', () => {
    const result = sanitizeUniversalFlatEntityUpdate({
      flatEntityUpdate: {} as any,
      metadataName: 'fieldMetadata' as AllMetadataName,
    });

    expect(result).toMatchSnapshot();
  });

  it('should preserve null values as they are valid updates for fieldMetadata', () => {
    const result = sanitizeUniversalFlatEntityUpdate({
      flatEntityUpdate: {
        isActive: false,
        label: null,
        description: 'Updated description',
      } as any,
      metadataName: 'fieldMetadata' as AllMetadataName,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return only valid properties for view metadata', () => {
    const result = sanitizeUniversalFlatEntityUpdate({
      flatEntityUpdate: {
        name: 'My View',
        icon: 'IconUser',
        invalidProperty: 'should be removed',
      } as any,
      metadataName: 'view' as AllMetadataName,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return only valid properties for objectMetadata', () => {
    const result = sanitizeUniversalFlatEntityUpdate({
      flatEntityUpdate: {
        isActive: true,
        labelSingular: 'Person',
        labelPlural: 'People',
        invalidProperty: 'should be removed',
      } as any,
      metadataName: 'objectMetadata' as AllMetadataName,
    });

    expect(result).toMatchSnapshot();
  });

  it('should handle viewField metadata updates', () => {
    const result = sanitizeUniversalFlatEntityUpdate({
      flatEntityUpdate: {
        position: 1,
        size: 100,
        isVisible: true,
        invalidProperty: 'should be removed',
      } as any,
      metadataName: 'viewField' as AllMetadataName,
    });

    expect(result).toMatchSnapshot();
  });

  it('should handle role metadata updates', () => {
    const result = sanitizeUniversalFlatEntityUpdate({
      flatEntityUpdate: {
        label: 'Admin Role',
        description: 'Administrator role',
        invalidProperty: 'should be removed',
      } as any,
      metadataName: 'role' as AllMetadataName,
    });

    expect(result).toMatchSnapshot();
  });

  it('should handle agent metadata updates', () => {
    const result = sanitizeUniversalFlatEntityUpdate({
      flatEntityUpdate: {
        name: 'My Agent',
        description: 'Agent description',
        invalidProperty: 'should be removed',
      } as any,
      metadataName: 'agent' as AllMetadataName,
    });

    expect(result).toMatchSnapshot();
  });

  it('should handle webhook metadata updates', () => {
    const result = sanitizeUniversalFlatEntityUpdate({
      flatEntityUpdate: {
        targetUrl: 'https://example.com/webhook',
        description: 'My webhook',
        invalidProperty: 'should be removed',
      } as any,
      metadataName: 'webhook' as AllMetadataName,
    });

    expect(result).toMatchSnapshot();
  });
});
