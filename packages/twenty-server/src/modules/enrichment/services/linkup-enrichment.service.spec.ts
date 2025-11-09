import { Test, type TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { of, throwError } from 'rxjs';

import type { AxiosResponse } from 'axios';

import { LinkupEnrichmentService } from './linkup-enrichment.service';

describe('LinkupEnrichmentService', () => {
  let service: LinkupEnrichmentService;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        LINKUP_API_KEY: 'test-api-key',
        LINKUP_API_URL: 'https://api.linkup.so/v1',
        LINKUP_ENABLED: true,
      };

      return config[key] ?? defaultValue;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockConfigService.get.mockImplementation(
      (key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          LINKUP_API_KEY: 'test-api-key',
          LINKUP_API_URL: 'https://api.linkup.so/v1',
          LINKUP_ENABLED: true,
        };

        return config[key] ?? defaultValue;
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkupEnrichmentService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LinkupEnrichmentService>(LinkupEnrichmentService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isEnabled', () => {
    it('should return true when enabled and API key is configured', () => {
      expect(service.isEnabled()).toBe(true);
    });

    it('should return false when API key is missing', () => {
      mockConfigService.get = jest.fn((key: string, defaultValue?: any) => {
        if (key === 'LINKUP_API_KEY') return '';
        if (key === 'LINKUP_ENABLED') return true;

        return defaultValue;
      });

      const newService = new LinkupEnrichmentService(
        httpService,
        mockConfigService as any,
      );

      expect(newService.isEnabled()).toBe(false);
    });
  });

  describe('searchCompany', () => {
    const mockResponse: AxiosResponse = {
      data: {
        answer: 'Test company description',
        sources: [
          { name: 'Source 1', url: 'https://example.com/1' },
          { name: 'Source 2', url: 'https://example.com/2' },
        ],
        results: [],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };

    it('should successfully search for a company', async () => {
      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.searchCompany('Test Company');

      expect(result).toEqual(mockResponse.data);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://api.linkup.so/v1/search',
        expect.objectContaining({
          query: expect.stringContaining('Test Company'),
          depth: 'standard',
          output_type: 'sourcedAnswer',
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should throw error when service is not enabled', async () => {
      mockConfigService.get = jest.fn((key: string, defaultValue?: any) => {
        return defaultValue ?? false;
      });
      const disabledService = new LinkupEnrichmentService(
        httpService,
        mockConfigService as any,
      );

      await expect(
        disabledService.searchCompany('Test Company'),
      ).rejects.toThrow('Linkup enrichment is not enabled or configured');
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');

      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.searchCompany('Test Company')).rejects.toThrow(
        'API Error',
      );
    });
  });

  describe('enrichCompany', () => {
    const mockLinkupResponse = {
      answer: 'Detailed company information about Test Corp',
      sources: [
        { name: 'LinkedIn', url: 'https://linkedin.com/company/test' },
        { name: 'Crunchbase', url: 'https://crunchbase.com/test' },
      ],
      results: [],
    };

    beforeEach(() => {
      const mockResponse: AxiosResponse = {
        data: mockLinkupResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
    });

    it('should successfully enrich a company', async () => {
      const result = await service.enrichCompany('Test Corp');

      expect(result.success).toBe(true);
      expect(result.description).toBe(mockLinkupResponse.answer);
      expect(result.sources).toEqual(mockLinkupResponse.sources);
      expect(result.error).toBeUndefined();
    });

    it('should return error for empty company name', async () => {
      const result = await service.enrichCompany('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Company name is required');
    });

    it('should return error when no information found', async () => {
      const emptyResponse: AxiosResponse = {
        data: { answer: '', sources: [], results: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(emptyResponse));

      const result = await service.enrichCompany('Unknown Company');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No information found');
    });

    it('should handle errors gracefully', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      const result = await service.enrichCompany('Test Corp');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should limit description to 5000 characters', async () => {
      const longAnswer = 'a'.repeat(10000);
      const longResponse: AxiosResponse = {
        data: { answer: longAnswer, sources: [], results: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(longResponse));

      const result = await service.enrichCompany('Test Corp');

      expect(result.success).toBe(true);
      expect(result.description?.length).toBe(5000);
    });
  });

  describe('formatForCompanyUpdate', () => {
    it('should format successful enrichment result', () => {
      const enrichmentResult = {
        success: true,
        description: 'Company description',
        sources: [
          { name: 'Source 1', url: 'https://example.com/1' },
          { name: 'Source 2', url: 'https://example.com/2' },
        ],
      };

      const formatted = service.formatForCompanyUpdate(enrichmentResult);

      expect(formatted).toEqual({
        idealCustomerProfile: 'Company description',
      });
    });

    it('should return null for failed enrichment', () => {
      const enrichmentResult = {
        success: false,
        error: 'Some error',
      };

      const formatted = service.formatForCompanyUpdate(enrichmentResult);

      expect(formatted).toBeNull();
    });
  });

  describe('enrichCompanies', () => {
    beforeEach(() => {
      const mockResponse: AxiosResponse = {
        data: {
          answer: 'Test description',
          sources: [],
          results: [],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));
    });

    it('should enrich multiple companies', async () => {
      const companies = ['Company A', 'Company B', 'Company C'];

      const results = await service.enrichCompanies(
        companies,
        undefined,
        'company',
        0,
      );

      expect(results.size).toBe(3);
      expect(results.get('Company A')?.success).toBe(true);
      expect(results.get('Company B')?.success).toBe(true);
      expect(results.get('Company C')?.success).toBe(true);
    });

    it('should handle partial failures in batch enrichment', async () => {
      let callCount = 0;

      mockHttpService.post.mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          return throwError(() => new Error('API Error'));
        }

        return of({
          data: { answer: 'Test', sources: [], results: [] },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });
      });

      const companies = ['Company A', 'Company B', 'Company C'];
      const results = await service.enrichCompanies(
        companies,
        undefined,
        'company',
        0,
      );

      expect(results.size).toBe(3);
      expect(results.get('Company A')?.success).toBe(true);
      expect(results.get('Company B')?.success).toBe(false);
      expect(results.get('Company C')?.success).toBe(true);
    });
  });
});
