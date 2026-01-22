import {
  escapePathSegment,
  joinVariablePath,
  needsEscaping,
  parseVariablePath,
} from '../variable-path.util';

describe('variable path utility functions', () => {
  describe('needsEscaping', () => {
    it('should return true for keys with spaces', () => {
      expect(needsEscaping('key with space')).toBe(true);
      expect(needsEscaping('toto toto')).toBe(true);
    });

    it('should return true for keys with dots', () => {
      expect(needsEscaping('key.with.dots')).toBe(true);
    });

    it('should return true for keys with brackets', () => {
      expect(needsEscaping('key[0]')).toBe(true);
      expect(needsEscaping('[key]')).toBe(true);
    });

    it('should return false for simple keys', () => {
      expect(needsEscaping('simpleKey')).toBe(false);
      expect(needsEscaping('camelCase')).toBe(false);
      expect(needsEscaping('snake_case')).toBe(false);
      expect(needsEscaping('kebab-case')).toBe(false);
    });

    describe('escapePathSegment', () => {
      it('should wrap keys with spaces in brackets', () => {
        expect(escapePathSegment('key with space')).toBe('[key with space]');
      });

      it('should wrap keys with dots in brackets', () => {
        expect(escapePathSegment('key.with.dots')).toBe('[key.with.dots]');
      });

      it('should not modify simple keys', () => {
        expect(escapePathSegment('simpleKey')).toBe('simpleKey');
      });
    });

    describe('joinVariablePath', () => {
      it('should join simple segments with dots', () => {
        expect(joinVariablePath(['step', 'field', 'value'])).toBe(
          'step.field.value',
        );
      });

      it('should escape segments with spaces', () => {
        expect(joinVariablePath(['step', 'key with space', 'value'])).toBe(
          'step.[key with space].value',
        );
      });

      it('should escape segments with dots', () => {
        expect(joinVariablePath(['step', 'key.with.dots'])).toBe(
          'step.[key.with.dots]',
        );
      });

      it('should handle mixed simple and special segments', () => {
        expect(
          joinVariablePath(['step', 'normal', 'has space', 'another']),
        ).toBe('step.normal.[has space].another');
      });

      it('should handle empty array', () => {
        expect(joinVariablePath([])).toBe('');
      });

      it('should handle single segment', () => {
        expect(joinVariablePath(['step'])).toBe('step');
        expect(joinVariablePath(['key with space'])).toBe('[key with space]');
      });
    });

    describe('parseVariablePath', () => {
      it('should parse simple dot-separated path', () => {
        expect(parseVariablePath('step.field.value')).toEqual([
          'step',
          'field',
          'value',
        ]);
      });

      it('should parse path with bracketed segments containing spaces', () => {
        expect(parseVariablePath('step.[key with space].value')).toEqual([
          'step',
          'key with space',
          'value',
        ]);
      });

      it('should parse path with bracketed segments containing dots', () => {
        expect(parseVariablePath('step.[key.with.dots]')).toEqual([
          'step',
          'key.with.dots',
        ]);
      });

      it('should handle multiple bracketed segments', () => {
        expect(
          parseVariablePath('[first key].[second key].[third key]'),
        ).toEqual(['first key', 'second key', 'third key']);
      });

      it('should handle mixed simple and bracketed segments', () => {
        expect(parseVariablePath('step.normal.[has space].another')).toEqual([
          'step',
          'normal',
          'has space',
          'another',
        ]);
      });

      it('should handle empty string', () => {
        expect(parseVariablePath('')).toEqual([]);
      });

      it('should handle single segment', () => {
        expect(parseVariablePath('step')).toEqual(['step']);
        expect(parseVariablePath('[key with space]')).toEqual([
          'key with space',
        ]);
      });

      it('should be inverse of joinVariablePath', () => {
        const paths = [
          ['step', 'field', 'value'],
          ['step', 'key with space', 'value'],
          ['step', 'key.with.dots'],
          ['step', 'normal', 'has space', 'another'],
        ];

        for (const path of paths) {
          const joined = joinVariablePath(path);
          const parsed = parseVariablePath(joined);
          expect(parsed).toEqual(path);
        }
      });
    });
  });
});
