import {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';

import { ForbiddenWordsConstraint } from 'src/engine/utils/custom-class-validator/ForbiddenWords';

describe('ForbiddenWordsConstraint', () => {
  let forbiddenWordsConstraint: ValidatorConstraintInterface;
  const forbiddenWords = ['foo', 'bar'];

  beforeEach(() => {
    forbiddenWordsConstraint = new ForbiddenWordsConstraint();
  });

  describe('validate', () => {
    it('should return false if the word is forbidden', () => {
      const result = forbiddenWordsConstraint.validate('foo', {
        constraints: forbiddenWords,
      } as ValidationArguments);

      expect(result).toBe(false);
    });

    it('should return true if the word is not forbidden', () => {
      const result = forbiddenWordsConstraint.validate('foo', {
        constraints: forbiddenWords,
      } as ValidationArguments);

      expect(result).toBe(true);
    });
  });

  describe('defaultMessage', () => {
    it('should return a message listing the forbidden words', () => {
      const message = forbiddenWordsConstraint.defaultMessage?.();

      expect(message).toBe('foo, bar are not allowed');
    });
  });
});
