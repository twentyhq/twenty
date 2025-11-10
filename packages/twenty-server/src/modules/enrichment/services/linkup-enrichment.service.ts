import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import * as fs from 'fs';
import * as path from 'path';

import { firstValueFrom } from 'rxjs';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

interface LinkupSource {
  name: string;
  url: string;
  snippet?: string;
}

interface LinkupSearchResponse {
  answer: string;
  sources: LinkupSource[];
  results: unknown[];
}

interface StructuredCompanyData {
  name?: string;
  revenue?: string;
  employees?: string;
  industry?: string;
  description?: string;
  address?: string;
  website?: string;
  linkedinUrl?: string;
  xUrl?: string;
}

interface EnrichmentResult {
  success: boolean;
  description?: string;
  sources?: LinkupSource[];
  structuredData?: StructuredCompanyData;
  error?: string;
}

@Injectable()
export class LinkupEnrichmentService {
  private readonly logger = new Logger(LinkupEnrichmentService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly enabled: boolean;
  private readonly enrichmentPrompts: Record<string, Record<string, string>>;

  constructor(
    private readonly httpService: HttpService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    this.apiUrl = this.twentyConfigService.get('LINKUP_API_URL');
    this.apiKey = this.twentyConfigService.get('LINKUP_API_KEY') || '';
    this.enabled = this.twentyConfigService.get('LINKUP_ENABLED');

    const configPath = path.join(
      __dirname,
      '..',
      'config',
      'enrichment-prompts.json',
    );

    try {
      const configContent = fs.readFileSync(configPath, 'utf-8');

      this.enrichmentPrompts = JSON.parse(configContent);
    } catch (error) {
      this.logger.warn(
        `Failed to load enrichment prompts config: ${error.message}. Using fallback.`,
      );
      this.enrichmentPrompts = {};
    }

    if (this.enabled && !this.apiKey) {
      this.logger.warn(
        'Linkup enrichment is enabled but API key is not configured',
      );
    }
  }

  isEnabled(): boolean {
    return this.enabled && !!this.apiKey;
  }

  private getFieldPrompt(objectType: string, fieldName: string): string {
    if (
      this.enrichmentPrompts[objectType] &&
      this.enrichmentPrompts[objectType][fieldName]
    ) {
      return this.enrichmentPrompts[objectType][fieldName];
    }

    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase();
  }

  async searchCompany(
    entityName: string,
    fieldsToEnrich?: string[],
    objectType: string = 'company',
  ): Promise<LinkupSearchResponse> {
    if (!this.isEnabled()) {
      throw new Error('Linkup enrichment is not enabled or configured');
    }

    let searchQuery = `${entityName} ${objectType}`;

    if (fieldsToEnrich && fieldsToEnrich.length > 0) {
      const fieldQueries = fieldsToEnrich.map((field) =>
        this.getFieldPrompt(objectType, field),
      );

      if (fieldQueries.length > 0) {
        searchQuery += ' ' + fieldQueries.join(' ');
      }
    } else {
      searchQuery += ' information overview details';
    }

    this.logger.debug(`Searching Linkup with query: ${searchQuery}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<LinkupSearchResponse>(
          `${this.apiUrl}/search`,
          {
            q: searchQuery,
            depth: 'standard',
            outputType: 'sourcedAnswer',
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Linkup API error for ${entityName}:`, error.message);
      throw error;
    }
  }

  async enrichCompany(
    entityName: string,
    fieldsToEnrich?: string[],
    objectType: string = 'company',
  ): Promise<EnrichmentResult> {
    try {
      if (!entityName || entityName.trim().length === 0) {
        return {
          success: false,
          error: 'Entity name is required',
        };
      }

      const searchResult = await this.searchCompany(
        entityName,
        fieldsToEnrich,
        objectType,
      );

      this.logger.log(
        `Linkup search result for ${entityName}: ${JSON.stringify(searchResult, null, 2)}`,
      );

      if (!searchResult.answer) {
        return {
          success: false,
          error: 'No information found',
        };
      }

      const description = searchResult.answer.substring(0, 5000);

      this.logger.log(
        `Description to parse (first 500 chars): ${description.substring(0, 500)}`,
      );

      const structuredData = this.parseStructuredData(description);

      this.logger.log(
        `Parsed structured data: ${JSON.stringify(structuredData, null, 2)}`,
      );

      return {
        success: true,
        description,
        structuredData,
        sources: searchResult.sources,
      };
    } catch (error) {
      this.logger.error(`Error enriching entity ${entityName}:`, error);

      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }

  formatForCompanyUpdate(enrichmentResult: EnrichmentResult) {
    if (!enrichmentResult.success) {
      return null;
    }

    return {
      idealCustomerProfile: enrichmentResult.description,
    };
  }

  async enrichCompanies(
    entityNames: string[],
    fieldsToEnrich?: string[],
    objectType: string = 'company',
    delayMs: number = 1000,
  ): Promise<Map<string, EnrichmentResult>> {
    const results = new Map<string, EnrichmentResult>();

    for (const name of entityNames) {
      try {
        const result = await this.enrichCompany(
          name,
          fieldsToEnrich,
          objectType,
        );

        results.set(name, result);

        if (delayMs > 0) {
          await this.delay(delayMs);
        }
      } catch (error) {
        this.logger.error(`Failed to enrich ${name}:`, error);

        results.set(name, {
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private parseStructuredData(
    description: string,
    sources?: LinkupSource[],
  ): StructuredCompanyData {
    const structuredData: StructuredCompanyData = {};

    const employeeMatch = description.match(
      /(\d+(?:,\d+)*)\s*(?:employees?|team members?|staff)/i,
    );

    if (employeeMatch) {
      structuredData.employees = employeeMatch[1].replace(/,/g, '');
    }

    const revenueMatch = description.match(
      /(?:revenue|ARR|annual revenue)?\s*(?:of\s*)?\$\s*(\d+(?:\.\d+)?)\s*(M|B|million|billion)/i,
    );

    if (revenueMatch) {
      const amount = parseFloat(revenueMatch[1]);
      const unit = revenueMatch[2].toLowerCase();
      const multiplier = unit.startsWith('b') === true ? 1000000000 : 1000000;

      structuredData.revenue = (amount * multiplier).toString();
    }

    if (sources && sources.length > 0) {
      for (const source of sources) {
        const url = source.url;

        if (
          !structuredData.linkedinUrl &&
          /linkedin\.com\/company\//i.test(url)
        ) {
          structuredData.linkedinUrl = url;
        }

        if (!structuredData.xUrl && /(twitter\.com|x\.com)\//i.test(url)) {
          structuredData.xUrl = url;
        }

        if (
          !structuredData.website &&
          !/linkedin|twitter|x\.com|facebook|instagram|crunchbase|pitchbook|zoominfo|rocketreach|owler|6sense|leadiq|cbinsights/i.test(
            url,
          ) &&
          /^https?:\/\//i.test(url)
        ) {
          structuredData.website = url;
        }
      }
    }

    if (!structuredData.linkedinUrl) {
      const linkedinMatch = description.match(
        /https?:\/\/(?:www\.)?linkedin\.com\/company\/[^\s)"\]]+/i,
      );

      if (linkedinMatch) {
        structuredData.linkedinUrl = linkedinMatch[0];
      }
    }

    if (!structuredData.xUrl) {
      const xUrlMatch = description.match(
        /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[^\s)"\]]+/i,
      );

      if (xUrlMatch) {
        structuredData.xUrl = xUrlMatch[0];
      } else {
        const handleMatch = description.match(
          /@([a-zA-Z0-9_]{1,15})(?:\s|$|[^a-zA-Z0-9_])/,
        );

        if (handleMatch) {
          structuredData.xUrl = `https://x.com/${handleMatch[1]}`;
        }
      }
    }

    if (!structuredData.website) {
      const websiteMatch = description.match(
        /https?:\/\/(?:www\.)?(?!linkedin\.com|twitter\.com|x\.com)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s)"\]]*/i,
      );

      if (websiteMatch) {
        structuredData.website = websiteMatch[0];
      }
    }

    if (!structuredData.address) {
      const addressPattern1 = description.match(
        /(?:headquarters|address|main office|physical address)[:\s]+([0-9]+[^.\n]{20,150}(?:USA|United States|US|America|Canada|UK|[A-Z]{2,3}\s*\d{5}))/i,
      );

      if (addressPattern1) {
        structuredData.address = addressPattern1[1].trim();
      } else {
        const addressPattern2 = description.match(
          /(?:located|based)\s+(?:in|at)\s+([^.\n]{20,150})/i,
        );

        if (addressPattern2) {
          structuredData.address = addressPattern2[1].trim();
        } else {
          const addressPattern3 = description.match(
            /(\d+\s+[A-Z][a-zA-Z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Parkway|Pkwy|Drive|Dr|Lane|Ln|Way|Court|Ct),?\s+[A-Z][a-zA-Z\s]+,?\s+[A-Z]{2,}[,\s]+\d{5}(?:-\d{4})?)/i,
          );

          if (addressPattern3) {
            structuredData.address = addressPattern3[1].trim();
          }
        }
      }
    }

    structuredData.description = description;

    return structuredData;
  }
}
