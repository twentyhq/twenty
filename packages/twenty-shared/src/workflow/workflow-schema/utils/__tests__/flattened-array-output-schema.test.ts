import { type BaseOutputSchemaV2 } from '../../types/base-output-schema.type';
import {
  getCurrentItemSchemaFromFlattenedArrayOutputSchema,
  isFlattenedArrayOutputSchema,
} from '../flattened-array-output-schema';

describe('isFlattenedArrayOutputSchema', () => {
  it('should return true for sequential numeric keys', () => {
    const schema: BaseOutputSchemaV2 = {
      '0': { isLeaf: false, type: 'object', label: '0', value: {} },
      '1': { isLeaf: false, type: 'object', label: '1', value: {} },
    };

    expect(isFlattenedArrayOutputSchema(schema)).toBe(true);
  });

  it('should return false for a regular object schema', () => {
    const schema: BaseOutputSchemaV2 = {
      message: { isLeaf: true, type: 'string', label: 'message', value: 'hi' },
    };

    expect(isFlattenedArrayOutputSchema(schema)).toBe(false);
  });

  it('should return false for non-sequential numeric keys', () => {
    const schema: BaseOutputSchemaV2 = {
      '0': { isLeaf: true, type: 'string', label: '0', value: 'a' },
      '2': { isLeaf: true, type: 'string', label: '2', value: 'b' },
    };

    expect(isFlattenedArrayOutputSchema(schema)).toBe(false);
  });

  it('should return false for an empty schema', () => {
    expect(isFlattenedArrayOutputSchema({})).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isFlattenedArrayOutputSchema(undefined)).toBe(false);
  });
});

describe('getCurrentItemSchemaFromFlattenedArrayOutputSchema', () => {
  it('should derive the current item from the first object element', () => {
    const schema: BaseOutputSchemaV2 = {
      '0': {
        isLeaf: false,
        type: 'object',
        label: '0',
        value: {
          hello: { isLeaf: true, type: 'string', label: 'hello', value: '1' },
        },
      },
      '1': {
        isLeaf: false,
        type: 'object',
        label: '1',
        value: {
          hello: { isLeaf: true, type: 'string', label: 'hello', value: '2' },
        },
      },
    };

    expect(getCurrentItemSchemaFromFlattenedArrayOutputSchema(schema)).toEqual({
      isLeaf: false,
      type: 'object',
      label: 'Current Item',
      value: {
        hello: { isLeaf: true, type: 'string', label: 'hello', value: '1' },
      },
    });
  });

  it('should derive the current item from the first primitive element', () => {
    const schema: BaseOutputSchemaV2 = {
      '0': { isLeaf: true, type: 'number', label: '0', value: 1 },
      '1': { isLeaf: true, type: 'number', label: '1', value: 2 },
    };

    expect(getCurrentItemSchemaFromFlattenedArrayOutputSchema(schema)).toEqual({
      isLeaf: true,
      type: 'number',
      label: 'Current Item',
      value: 1,
    });
  });

  it('should support a custom label', () => {
    const schema: BaseOutputSchemaV2 = {
      '0': { isLeaf: true, type: 'string', label: '0', value: 'a' },
    };

    expect(
      getCurrentItemSchemaFromFlattenedArrayOutputSchema(schema, 'Item'),
    ).toEqual({
      isLeaf: true,
      type: 'string',
      label: 'Item',
      value: 'a',
    });
  });

  it('should return undefined when schema is not a flattened array', () => {
    const schema: BaseOutputSchemaV2 = {
      message: { isLeaf: true, type: 'string', label: 'message', value: 'hi' },
    };

    expect(
      getCurrentItemSchemaFromFlattenedArrayOutputSchema(schema),
    ).toBeUndefined();
  });
});
