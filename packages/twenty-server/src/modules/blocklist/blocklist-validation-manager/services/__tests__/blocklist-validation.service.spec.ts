import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

import { BlocklistValidationService } from '../blocklist-validation.service';

const buildBlocklistItem = (handle: string | null) =>
  ({
    id: 'test-id',
    handle,
    workspaceMemberId: 'member-id',
  }) as any;

describe('BlocklistValidationService', () => {
  let service: BlocklistValidationService;

  beforeEach(() => {
    // validateSchema only uses Zod + isValidHostname, no injected dependencies
    service = new BlocklistValidationService(
      {} as any, // BlocklistRepository — unused by validateSchema
      {} as any, // GlobalWorkspaceOrmManager — unused by validateSchema
    );
  });

  describe('validateSchema', () => {
    it('should accept a valid email address', async () => {
      await expect(
        service.validateSchema([buildBlocklistItem('eddy@gmail.com')]),
      ).resolves.not.toThrow();
    });

    it('should accept a valid domain with @ prefix', async () => {
      await expect(
        service.validateSchema([buildBlocklistItem('@apple.com')]),
      ).resolves.not.toThrow();
    });

    it('should accept a multi-level subdomain with @ prefix', async () => {
      // This was the bug: old isDomain() rejected multi-level subdomains
      await expect(
        service.validateSchema([
          buildBlocklistItem('@sub.domain.example.com'),
        ]),
      ).resolves.not.toThrow();
    });

    it('should accept a valid email with leading/trailing whitespace (trimmed by Zod)', async () => {
      await expect(
        service.validateSchema([
          buildBlocklistItem(' user@example.com '),
        ]),
      ).resolves.not.toThrow();
    });

    it('should reject a plain string that is not an email or domain', async () => {
      await expect(
        service.validateSchema([buildBlocklistItem('not-an-email')]),
      ).rejects.toThrow(CommonQueryRunnerException);

      await expect(
        service.validateSchema([buildBlocklistItem('not-an-email')]),
      ).rejects.toMatchObject({
        code: CommonQueryRunnerExceptionCode.BAD_REQUEST,
      });
    });

    it('should reject a domain without @ prefix', async () => {
      await expect(
        service.validateSchema([buildBlocklistItem('apple.com')]),
      ).rejects.toThrow(CommonQueryRunnerException);

      await expect(
        service.validateSchema([buildBlocklistItem('apple.com')]),
      ).rejects.toMatchObject({
        code: CommonQueryRunnerExceptionCode.BAD_REQUEST,
      });
    });

    it('should throw BAD_REQUEST with "required" message for an empty handle', async () => {
      await expect(
        service.validateSchema([buildBlocklistItem('')]),
      ).rejects.toThrow(CommonQueryRunnerException);

      await expect(
        service.validateSchema([buildBlocklistItem('')]),
      ).rejects.toMatchObject({
        code: CommonQueryRunnerExceptionCode.BAD_REQUEST,
        message: 'Blocklist handle is required',
      });
    });

    it('should throw BAD_REQUEST with "required" message for a null handle', async () => {
      await expect(
        service.validateSchema([buildBlocklistItem(null)]),
      ).rejects.toThrow(CommonQueryRunnerException);

      await expect(
        service.validateSchema([buildBlocklistItem(null)]),
      ).rejects.toMatchObject({
        code: CommonQueryRunnerExceptionCode.BAD_REQUEST,
        message: 'Blocklist handle is required',
      });
    });

    it('should reject an IP address domain (allowIp: false)', async () => {
      await expect(
        service.validateSchema([buildBlocklistItem('@192.168.1.1')]),
      ).rejects.toThrow(CommonQueryRunnerException);

      await expect(
        service.validateSchema([buildBlocklistItem('@192.168.1.1')]),
      ).rejects.toMatchObject({
        code: CommonQueryRunnerExceptionCode.BAD_REQUEST,
      });
    });

    it('should reject localhost domain (allowLocalhost: false)', async () => {
      await expect(
        service.validateSchema([buildBlocklistItem('@localhost')]),
      ).rejects.toThrow(CommonQueryRunnerException);

      await expect(
        service.validateSchema([buildBlocklistItem('@localhost')]),
      ).rejects.toMatchObject({
        code: CommonQueryRunnerExceptionCode.BAD_REQUEST,
      });
    });
  });
});
