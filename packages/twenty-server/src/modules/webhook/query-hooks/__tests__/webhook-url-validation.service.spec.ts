import { Test, TestingModule } from '@nestjs/testing';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { WebhookUrlValidationService } from 'src/modules/webhook/query-hooks/webhook-url-validation.service';

describe('WebhookUrlValidationService', () => {
  let service: WebhookUrlValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhookUrlValidationService],
    }).compile();

    service = module.get<WebhookUrlValidationService>(
      WebhookUrlValidationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateWebhookUrl', () => {
    it('should accept valid HTTP URLs', () => {
      expect(() => {
        service.validateWebhookUrl('http://example.com/webhook');
      }).not.toThrow();
    });

    it('should accept valid HTTPS URLs', () => {
      expect(() => {
        service.validateWebhookUrl('https://example.com/webhook');
      }).not.toThrow();
    });

    it('should accept URLs with ports', () => {
      expect(() => {
        service.validateWebhookUrl('http://localhost:3000/webhook');
      }).not.toThrow();
    });

    it('should accept URLs with paths and query parameters', () => {
      expect(() => {
        service.validateWebhookUrl(
          'https://api.example.com/webhooks/receive?token=abc123',
        );
      }).not.toThrow();
    });

    it('should reject URLs without scheme', () => {
      expect(() => {
        service.validateWebhookUrl('example.com/webhook');
      }).toThrow(GraphqlQueryRunnerException);
    });

    it('should reject malformed URLs', () => {
      expect(() => {
        service.validateWebhookUrl('not-a-url');
      }).toThrow(GraphqlQueryRunnerException);
    });

    it('should reject URLs with FTP scheme', () => {
      expect(() => {
        service.validateWebhookUrl('ftp://example.com/webhook');
      }).toThrow(GraphqlQueryRunnerException);
    });

    it('should reject URLs with mailto scheme', () => {
      expect(() => {
        service.validateWebhookUrl('mailto:user@example.com');
      }).toThrow(GraphqlQueryRunnerException);
    });

    it('should reject URLs with custom schemes', () => {
      expect(() => {
        service.validateWebhookUrl('custom://example.com/webhook');
      }).toThrow(GraphqlQueryRunnerException);
    });

    it('should provide helpful error message for malformed URLs', () => {
      try {
        service.validateWebhookUrl('example.com/webhook');
        fail('Expected exception to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(GraphqlQueryRunnerException);
        expect(error.code).toBe(
          GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        );
        expect(error.message).toContain('Invalid URL: missing scheme');
        expect(error.message).toContain('example.com/webhook');
      }
    });

    it('should provide helpful error message for invalid scheme', () => {
      try {
        service.validateWebhookUrl('ftp://example.com/webhook');
        fail('Expected exception to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(GraphqlQueryRunnerException);
        expect(error.code).toBe(
          GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        );
        expect(error.message).toContain('Only HTTP and HTTPS are allowed');
        expect(error.message).toContain('ftp:');
      }
    });

    it('should reject empty strings', () => {
      expect(() => {
        service.validateWebhookUrl('');
      }).toThrow(GraphqlQueryRunnerException);
    });
  });
});
