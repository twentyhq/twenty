import { Injectable, Logger } from '@nestjs/common';

import { type AxiosInstance } from 'axios';
import { isDefined } from 'twenty-shared/utils';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import {
  type CompanyEnrichmentInput,
  type CompanyEnrichmentProvider,
  type PartialCompanyEnrichment,
} from 'src/modules/enso/company-enrichment/providers/company-enrichment-provider.interface';

// Moldova business-registry enrichment via data2b.md — the richest free-tier
// source for MD firmographics (legal name, IDNO, address, founders,
// administrator, activity, financials). Official open data (date.gov.md) is
// stale bulk XLSX, and idno.md/datero.md expose no API; data2b.md has a real
// token-authed REST API:
//
//   GET {base}/companies/?q=<name>   → search (array)
//   GET {base}/companies/{idno}/     → detail (single)
//   Authorization: Token <token>     → 429 when the monthly quota is exceeded
//
// Config (no key → provider is silently disabled):
//   ENSO_DATA2B_API_TOKEN   required; obtained from data2b.md (contact them)
//   ENSO_DATA2B_BASE_URL    optional override (default below)
//   ENSO_DATA2B_NAME_SEARCH 'true' to allow name-search lookups; default OFF so
//                           we only spend quota on exact IDNO lookups (a derived
//                           name is a poor, quota-wasting match key).
//
// Runs LAST in the chain (after a name/IDNO is resolved upstream). Never throws.
const DEFAULT_BASE_URL = 'https://www.data2b.md/api/v1';

type Data2bCompany = Record<string, any>;

@Injectable()
export class MoldovaData2bEnrichmentProvider implements CompanyEnrichmentProvider {
  readonly providerName = 'moldova-data2b';
  private readonly logger = new Logger(MoldovaData2bEnrichmentProvider.name);
  private readonly httpClient: AxiosInstance;
  private readonly token = process.env.ENSO_DATA2B_API_TOKEN;
  private readonly nameSearchEnabled =
    process.env.ENSO_DATA2B_NAME_SEARCH === 'true';

  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {
    this.httpClient = this.secureHttpClientService.getHttpClient({
      baseURL: process.env.ENSO_DATA2B_BASE_URL ?? DEFAULT_BASE_URL,
    });
  }

  isEnabled(): boolean {
    return isDefined(this.token) && this.token.length > 0;
  }

  async enrich(
    input: CompanyEnrichmentInput,
  ): Promise<PartialCompanyEnrichment | null> {
    if (!this.isEnabled()) {
      return null;
    }

    const idno = this.normalizeIdno(input.registrationNumber);

    const raw = idno
      ? await this.getByIdno(idno)
      : this.nameSearchEnabled && isDefined(input.name)
        ? await this.searchByName(input.name)
        : null;

    if (!raw) {
      return null;
    }

    return this.mapCompany(raw);
  }

  private async getByIdno(idno: string): Promise<Data2bCompany | null> {
    try {
      const response = await this.httpClient.get(`/companies/${idno}/`, {
        headers: { Authorization: `Token ${this.token}` },
      });

      return this.unwrap(response.data);
    } catch (error) {
      this.logFailure('idno lookup', idno, error);

      return null;
    }
  }

  private async searchByName(name: string): Promise<Data2bCompany | null> {
    try {
      const response = await this.httpClient.get(`/companies/`, {
        params: { q: name },
        headers: { Authorization: `Token ${this.token}` },
      });

      const results = Array.isArray(response.data)
        ? response.data
        : (response.data?.results ?? []);

      // Name search is fuzzy — take the first hit only. (Refine here if needed.)
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      this.logFailure('name search', name, error);

      return null;
    }
  }

  // Moldovan IDNO is 13 digits. Return it only when the input is a clean IDNO so
  // we don't spend an API call on a foreign VAT / garbage.
  private normalizeIdno(value: string | undefined): string | null {
    const digits = (value ?? '').replace(/\D/g, '');

    return /^\d{13}$/.test(digits) ? digits : null;
  }

  private unwrap(data: unknown): Data2bCompany | null {
    if (Array.isArray(data)) {
      return data.length > 0 ? data[0] : null;
    }

    return isDefined(data) && typeof data === 'object'
      ? (data as Data2bCompany)
      : null;
  }

  // PROVISIONAL field mapping. The data2b company object fields depend on the
  // API package and aren't enumerated in their OpenAPI schema, so this reads a
  // set of candidate keys (EN + RO). On the first successful call the actual
  // keys are logged (debug) — finalize this mapping against a real response.
  private mapCompany(raw: Data2bCompany): PartialCompanyEnrichment | null {
    this.logger.debug(`data2b response keys: ${Object.keys(raw).join(', ')}`);

    const result: PartialCompanyEnrichment = {};

    const legalName = this.pick(raw, [
      'name',
      'legal_name',
      'denumire',
      'title',
      'full_name',
    ]);

    // Set legalName only — never overwrite the (better) trade name an earlier
    // provider resolved. DomainDerived guarantees a base `name` already.
    if (legalName) {
      result.legalName = legalName;
    }

    const idno = this.pick(raw, ['idno', 'id', 'fiscal_code', 'cod_fiscal']);

    if (idno) {
      result.registrationNumber = idno;
    }

    const industry = this.pick(raw, [
      'activity',
      'main_activity',
      'activity_name',
      'gen_activitate',
      'caem',
      'caem_name',
    ]);

    if (industry) {
      result.industry = industry;
    }

    const description = this.pick(raw, ['description', 'about', 'descriere']);

    if (description) {
      result.description = description;
    }

    const foundedYear = this.parseYear(
      this.pick(raw, [
        'registration_date',
        'founded',
        'founded_at',
        'data_inregistrarii',
        'created_at',
      ]),
    );

    if (isDefined(foundedYear)) {
      result.foundedYear = foundedYear;
    }

    const employees = this.parseNumber(
      this.pick(raw, ['employees', 'employees_count', 'staff', 'angajati']),
    );

    if (isDefined(employees)) {
      result.employees = employees;
    }

    const revenue = this.parseNumber(
      this.pick(raw, [
        'revenue',
        'turnover',
        'income',
        'venit',
        'cifra_afaceri',
      ]),
    );

    if (isDefined(revenue)) {
      result.annualRevenueAmount = revenue;
    }

    const phone = this.pick(raw, ['phone', 'telephone', 'telefon']);

    if (phone) {
      result.phone = phone;
    }

    this.mapAddress(raw, result);

    return Object.keys(result).length > 0 ? result : null;
  }

  private mapAddress(
    raw: Data2bCompany,
    result: PartialCompanyEnrichment,
  ): void {
    const address = raw.address ?? raw.adresa ?? raw.legal_address;

    if (typeof address === 'string' && address.length > 0) {
      result.addressStreet1 = address;
      result.addressCountry = 'Moldova';

      return;
    }

    if (isDefined(address) && typeof address === 'object') {
      const city = this.pick(address, [
        'city',
        'locality',
        'oras',
        'localitate',
      ]);
      const street = this.pick(address, ['street', 'address', 'strada']);

      if (city) result.addressCity = city;
      if (street) result.addressStreet1 = street;
      result.addressCountry = 'Moldova';
    }
  }

  private pick(
    source: Record<string, any>,
    keys: string[],
  ): string | undefined {
    for (const key of keys) {
      const value = source?.[key];

      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
      if (typeof value === 'number') {
        return String(value);
      }
    }

    return undefined;
  }

  private parseYear(value: string | undefined): number | undefined {
    if (!value) {
      return undefined;
    }

    const match = value.match(/(\d{4})/);
    const year = match ? Number(match[1]) : NaN;

    return Number.isInteger(year) && year >= 1800 && year <= 2100
      ? year
      : undefined;
  }

  private parseNumber(value: string | undefined): number | undefined {
    if (!value) {
      return undefined;
    }

    const cleaned = Number(value.replace(/[^\d.]/g, ''));

    return Number.isFinite(cleaned) && cleaned > 0 ? cleaned : undefined;
  }

  private logFailure(operation: string, key: string, error: unknown): void {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;

    if (status === 429) {
      this.logger.warn('data2b monthly quota exceeded (429)');

      return;
    }

    this.logger.debug(
      `data2b ${operation} failed for "${key}": ${(error as Error).message}`,
    );
  }
}
