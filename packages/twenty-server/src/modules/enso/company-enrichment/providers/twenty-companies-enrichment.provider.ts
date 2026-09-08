import { Injectable, Logger } from '@nestjs/common';

import { type AxiosInstance } from 'axios';
import { TWENTY_COMPANIES_BASE_URL } from 'twenty-shared/constants';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import {
  type CompanyEnrichmentInput,
  type CompanyEnrichmentProvider,
  type PartialCompanyEnrichment,
} from 'src/modules/enso/company-enrichment/providers/company-enrichment-provider.interface';

// The free endpoint Twenty already uses in contact-creation
// (twenty-companies.com/{domain}) — returns at least { name, city } and
// sometimes a logo/other firmographics. SSRF-safe via SecureHttpClientService.
// Cheap and always enabled; it fills name + city the offline provider can't.
@Injectable()
export class TwentyCompaniesEnrichmentProvider implements CompanyEnrichmentProvider {
  readonly providerName = 'twenty-companies';
  private readonly logger = new Logger(TwentyCompaniesEnrichmentProvider.name);
  private readonly httpClient: AxiosInstance;

  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {
    this.httpClient = this.secureHttpClientService.getHttpClient({
      baseURL: TWENTY_COMPANIES_BASE_URL,
    });
  }

  isEnabled(): boolean {
    return true;
  }

  async enrich(
    input: CompanyEnrichmentInput,
  ): Promise<PartialCompanyEnrichment | null> {
    try {
      const response = await this.httpClient.get(`/${input.domain}`);
      const data = response.data ?? {};

      const result: PartialCompanyEnrichment = {};

      if (typeof data.name === 'string' && data.name.length > 0) {
        result.name = data.name;
      }
      if (typeof data.city === 'string' && data.city.length > 0) {
        result.addressCity = data.city;
      }

      return Object.keys(result).length > 0 ? result : null;
    } catch (error) {
      this.logger.debug(
        `twenty-companies lookup failed for ${input.domain}: ${(error as Error).message}`,
      );

      return null;
    }
  }
}
