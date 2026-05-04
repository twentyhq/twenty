import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { computeMessageDirection } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-message-direction.util';

/**
 * Tests for computeMessageDirection utility.
 * Covers fix for issue #20011: outgoing emails incorrectly labeled as INCOMING.
 */
describe('computeMessageDirection', () => {
  const connectedAccount = {
    handle: 'user@example.com',
    handleAliases: ['alias@example.com', 'me@work.com'],
  };

  describe('OUTGOING detection (primary handle)', () => {
    it('should return OUTGOING when fromHandle matches handle exactly', () => {
      expect(
        computeMessageDirection('user@example.com', connectedAccount),
      ).toBe(MessageDirection.OUTGOING);
    });

    it('should return OUTGOING when fromHandle matches handle with different case (fix #20011)', () => {
      expect(
        computeMessageDirection('User@Example.COM', connectedAccount),
      ).toBe(MessageDirection.OUTGOING);
    });

    it('should return OUTGOING when fromHandle has leading/trailing whitespace', () => {
      expect(
        computeMessageDirection('  user@example.com  ', connectedAccount),
      ).toBe(MessageDirection.OUTGOING);
    });

    it('should return OUTGOING when fromHandle is uppercase', () => {
      expect(
        computeMessageDirection('USER@EXAMPLE.COM', connectedAccount),
      ).toBe(MessageDirection.OUTGOING);
    });
  });

  describe('OUTGOING detection (aliases)', () => {
    it('should return OUTGOING when fromHandle matches an alias', () => {
      expect(
        computeMessageDirection('alias@example.com', connectedAccount),
      ).toBe(MessageDirection.OUTGOING);
    });

    it('should return OUTGOING when fromHandle matches an alias with different case (fix #20011)', () => {
      expect(
        computeMessageDirection('ALIAS@EXAMPLE.COM', connectedAccount),
      ).toBe(MessageDirection.OUTGOING);
    });

    it('should return OUTGOING when fromHandle matches second alias', () => {
      expect(computeMessageDirection('me@work.com', connectedAccount)).toBe(
        MessageDirection.OUTGOING,
      );
    });
  });

  describe('INCOMING detection', () => {
    it('should return INCOMING when fromHandle does not match handle or aliases', () => {
      expect(
        computeMessageDirection('other@domain.com', connectedAccount),
      ).toBe(MessageDirection.INCOMING);
    });

    it('should return INCOMING for an empty fromHandle', () => {
      expect(computeMessageDirection('', connectedAccount)).toBe(
        MessageDirection.INCOMING,
      );
    });

    it('should return INCOMING when fromHandle is a partial match of handle', () => {
      expect(computeMessageDirection('user', connectedAccount)).toBe(
        MessageDirection.INCOMING,
      );
    });
  });

  describe('null/undefined handleAliases', () => {
    it('should return OUTGOING when handle matches and handleAliases is null', () => {
      const accountNoAliases = {
        handle: 'user@example.com',
        handleAliases: null,
      };

      expect(
        computeMessageDirection('user@example.com', accountNoAliases as any),
      ).toBe(MessageDirection.OUTGOING);
    });

    it('should return INCOMING when handle does not match and handleAliases is null', () => {
      const accountNoAliases = {
        handle: 'user@example.com',
        handleAliases: null,
      };

      expect(
        computeMessageDirection('other@example.com', accountNoAliases as any),
      ).toBe(MessageDirection.INCOMING);
    });

    it('should return OUTGOING when handle matches and handleAliases is undefined', () => {
      const accountNoAliases = {
        handle: 'user@example.com',
        handleAliases: undefined,
      };

      expect(
        computeMessageDirection('user@example.com', accountNoAliases as any),
      ).toBe(MessageDirection.OUTGOING);
    });
  });
});
