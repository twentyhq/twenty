const DEFAULT_BASE_URL = 'https://crm.skilland.ai';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function readTwentyCredentials() {
  if (!process.env.TWENTY_API_KEY) {
    throw new Error('TWENTY_API_KEY is not set');
  }

  return {
    apiKey: process.env.TWENTY_API_KEY,
    baseUrl: (process.env.TWENTY_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, ''),
  };
}

export class TwentyClient {
  constructor({ apiKey, baseUrl }) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async requestJson(url, init = {}, attempt = 0) {
    const response = await fetch(url, {
      ...init,
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        'content-type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

    if ((response.status === 429 || response.status >= 502) && attempt < 8) {
      const wait = Math.min(60_000, 2_000 * 2 ** attempt);
      console.warn(`  ! ${response.status} on ${url}, retrying in ${wait / 1000}s`);
      await sleep(wait);
      return this.requestJson(url, init, attempt + 1);
    }

    const text = await response.text();
    let json = {};

    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON response from ${url}: ${text.slice(0, 500)}`);
      }
    }

    if (!response.ok || json.errors?.length) {
      throw new Error(
        `Twenty API error ${response.status} on ${init.method ?? 'GET'} ${url}: ${JSON.stringify(json).slice(0, 1500)}`,
      );
    }

    return json;
  }

  async gql(query, variables = {}) {
    const json = await this.requestJson(`${this.baseUrl}/graphql`, {
      method: 'POST',
      body: JSON.stringify({ query, variables }),
    });

    return json.data;
  }

  async metadataObjects() {
    const json = await this.requestJson(`${this.baseUrl}/rest/metadata/objects`);
    return json.data.objects;
  }

  async createField(input) {
    const json = await this.requestJson(`${this.baseUrl}/rest/metadata/fields`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return Object.values(json.data ?? {})[0];
  }

  async updateField(id, input) {
    const json = await this.requestJson(`${this.baseUrl}/rest/metadata/fields/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return Object.values(json.data ?? {})[0];
  }

  async createObject(input) {
    const json = await this.requestJson(`${this.baseUrl}/rest/metadata/objects`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return Object.values(json.data ?? {})[0];
  }

  async metadataViewGroups() {
    const json = await this.requestJson(`${this.baseUrl}/rest/metadata/viewGroups`);
    return json.data;
  }

  async updateViewGroup(id, update) {
    const json = await this.requestJson(`${this.baseUrl}/metadata`, {
      method: 'POST',
      body: JSON.stringify({
        query:
          'mutation ($input: UpdateViewGroupInput!) { updateViewGroup(input: $input) { id position } }',
        variables: { input: { id, update } },
      }),
    });
    return json.data.updateViewGroup;
  }

  async fetchAll(plural, selection, filter) {
    const records = [];
    let after = null;
    const filterArg = filter ? ', filter: $filter' : '';
    const filterVar = filter ? ', $filter: ' + filter.type : '';

    for (;;) {
      const data = await this.gql(
        `query ($after: String${filterVar}) { ${plural}(first: 100, after: $after${filterArg}) {
          edges { node { ${selection} } }
          pageInfo { hasNextPage endCursor }
        } }`,
        { after, ...(filter ? { filter: filter.value } : {}) },
      );
      const page = data[plural];
      records.push(...page.edges.map((edge) => edge.node));
      if (!page.pageInfo.hasNextPage) break;
      after = page.pageInfo.endCursor;
    }

    return records;
  }
}
