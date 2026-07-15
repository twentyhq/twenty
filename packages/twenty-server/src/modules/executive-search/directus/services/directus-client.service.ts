import { Injectable, Logger } from '@nestjs/common';

import {
  DirectusAuthResponse,
  DirectusCollection,
  DirectusField,
  DirectusItemResponse,
  DirectusItemsResponse,
  DirectusSchemaInfo,
} from 'src/modules/executive-search/directus/types/directus-types';

/**
 * Directus REST API client.
 *
 * Handles authentication, schema retrieval, and item access with
 * rate-limit awareness and secure credential handling.  Writes are
 * disabled — this is a read-only/shadow adapter.
 */
@Injectable()
export class DirectusClientService {
  private readonly logger = new Logger(DirectusClientService.name);

  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  /** Minimum time (ms) between requests for rate limiting. */
  private static readonly RATE_LIMIT_MS = 200;

  private lastRequestTime: number = 0;

  constructor() {
    // Base URL and credentials are injected at runtime via the sync service
    // to keep secrets out of constructors and logs.
    this.baseUrl = '';
  }

  /**
   * Configure the client with connection details.
   * Secrets must never be logged.
   */
  configure(baseUrl: string): void {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  /**
   * Authenticate with Directus using static token or email/password.
   * Token is held in memory only; never persisted to logs or the database.
   */
  async authenticate(email: string, password: string): Promise<void> {
    const url = `${this.baseUrl}/auth/login`;
    this.logger.log('Authenticating with Directus');

    const response = await this.request<DirectusAuthResponse>(url, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    this.accessToken = response.data.accessToken;
    this.tokenExpiresAt = Date.now() + response.data.expires;
  }

  /**
   * Check if the authenticated session is valid.
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null && Date.now() < this.tokenExpiresAt;
  }

  /**
   * Fetch server info (version, node info, etc.).
   */
  async getServerInfo(): Promise<DirectusSchemaInfo> {
    const { data } = await this.request<{ data: DirectusSchemaInfo }>(
      `${this.baseUrl}/server/info`,
    );
    return data;
  }

  /**
   * Fetch all collections and their metadata.
   */
  async getCollections(): Promise<DirectusCollection[]> {
    const { data } = await this.request<DirectusItemsResponse<DirectusCollection>>(
      `${this.baseUrl}/collections`,
    );
    return data;
  }

  /**
   * Fetch all fields across all collections.
   * Uses the Directus /fields endpoint without a collection filter.
   */
  async getAllFields(): Promise<DirectusField[]> {
    let allFields: DirectusField[] = [];
    let page = 0;
    const limit = 200;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data } = await this.request<DirectusItemsResponse<DirectusField>>(
        `${this.baseUrl}/fields?limit=${limit}&offset=${page * limit}`,
      );
      if (!data || data.length === 0) break;

      allFields = allFields.concat(data);
      page++;
    }

    return allFields;
  }

  /**
   * Fetch all fields for a collection.
   */
  async getFields(collection: string): Promise<DirectusField[]> {
    let allFields: DirectusField[] = [];
    let page = 0;
    const limit = 200;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data } = await this.request<DirectusItemsResponse<DirectusField>>(
        `${this.baseUrl}/fields/${collection}?limit=${limit}&offset=${page * limit}`,
      );
      if (!data || data.length === 0) break;

      allFields = allFields.concat(data);
      page++;
    }

    return allFields;
  }

  /**
   * Fetch items from a collection.
   */
  async getItems<T = Record<string, unknown>>(
    collection: string,
    options?: {
      limit?: number;
      offset?: number;
      filter?: Record<string, unknown>;
      fields?: string[];
      sort?: string;
    },
  ): Promise<T[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('offset', String(options.offset));
    if (options?.filter) params.set('filter', JSON.stringify(options.filter));
    if (options?.fields) params.set('fields', options.fields.join(','));
    if (options?.sort) params.set('sort', options.sort);

    const query = params.toString();
    const url = `${this.baseUrl}/items/${collection}${query ? '?' + query : ''}`;

    const { data } = await this.request<DirectusItemsResponse<T>>(url);
    return data;
  }

  /**
   * Fetch the raw schema snapshot for fingerprinting.
   */
  async getRawSchemaSnapshot(): Promise<{
    collections: DirectusCollection[];
    serverInfo: DirectusSchemaInfo;
    collectedAt: string;
  }> {
    const [collections, serverInfo] = await Promise.all([
      this.getCollections(),
      this.getServerInfo(),
    ]);

    return {
      collections,
      serverInfo,
      collectedAt: new Date().toISOString(),
    };
  }

  /**
   * Create an item in a Directus collection.
   */
  async createItem<T>(
    collection: string,
    body: string,
    headers?: Record<string, string>,
  ): Promise<T> {
    if (!this.isAuthenticated()) {
      throw new Error(
        'Cannot perform write operations before authenticating with Directus',
      );
    }

    const url = `${this.baseUrl}/items/${collection}`;
    const response = await this.request<DirectusItemResponse<T>>(url, {
      method: 'POST',
      body,
      headers,
    });

    return response.data;
  }

  /**
   * Update an item in a Directus collection by ID.
   */
  async updateItem<T>(
    collection: string,
    id: string,
    body: string,
    headers?: Record<string, string>,
  ): Promise<T> {
    if (!this.isAuthenticated()) {
      throw new Error(
        'Cannot perform write operations before authenticating with Directus',
      );
    }

    const url = `${this.baseUrl}/items/${collection}/${id}`;
    const response = await this.request<DirectusItemResponse<T>>(url, {
      method: 'PATCH',
      body,
      headers,
    });

    return response.data;
  }

  /**
   * Delete an item from a Directus collection by ID.
   */
  async deleteItem(
    collection: string,
    id: string,
    headers?: Record<string, string>,
  ): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error(
        'Cannot perform write operations before authenticating with Directus',
      );
    }

    const url = `${this.baseUrl}/items/${collection}/${id}`;
    await this.request<void>(url, {
      method: 'DELETE',
      headers,
      suppressJsonParse: true,
    });
  }

  /**
   * Core HTTP request wrapper with auth, rate limiting, and error handling.
   */
  private async request<T>(
    url: string,
    options?: RequestInit & { suppressJsonParse?: boolean },
  ): Promise<T> {
    await this.applyRateLimit();

    const suppressJsonParse = options?.suppressJsonParse;
    const fetchOptions: RequestInit = options || {};

    const headers: Record<string, string> = {
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    this.logger.debug(
      `Directus API: ${fetchOptions.method || 'GET'} ${url.split('?')[0]}`,
    );

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `Directus API error ${response.status} ${response.statusText}: ${body.slice(0, 500)}`,
      );
    }

    if (suppressJsonParse) {
      return undefined as T;
    }

    const json = (await response.json()) as T;
    return json;
  }

  /**
   * Simple rate limiting to avoid overwhelming the Directus instance.
   */
  private async applyRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;

    if (elapsed < DirectusClientService.RATE_LIMIT_MS) {
      const wait = DirectusClientService.RATE_LIMIT_MS - elapsed;
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

    this.lastRequestTime = Date.now();
  }
}
