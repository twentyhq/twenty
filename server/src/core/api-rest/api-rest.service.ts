import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { Request } from 'express';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { ApiRestQueryBuilderFactory } from 'src/core/api-rest/api-rest-query-builder/api-rest-query-builder.factory';
import { TokenService } from 'src/core/auth/services/token.service';
import { ApiRestResponse } from 'src/core/api-rest/types/api-rest-response.type';
import { ApiRestQuery } from 'src/core/api-rest/types/api-rest-query.type';

@Injectable()
export class ApiRestService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly environmentService: EnvironmentService,
    private readonly apiRestQueryBuilderFactory: ApiRestQueryBuilderFactory,
  ) {}

  async callGraphql(
    request: Request,
    data: ApiRestQuery,
  ): Promise<ApiRestResponse> {
    const baseUrl =
      this.environmentService.getServerUrl() ||
      `${request.protocol}://${request.get('host')}`;

    return await axios.post(`${baseUrl}/graphql`, data, {
      headers: {
        Authorization: request.headers.authorization,
      },
    });
  }

  async get(request: Request): Promise<ApiRestResponse> {
    try {
      const data = await this.apiRestQueryBuilderFactory.get(request);

      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: `${err}`, status: err.response.status } };
    }
  }

  async delete(request: Request): Promise<ApiRestResponse> {
    try {
      const data = await this.apiRestQueryBuilderFactory.delete(request);

      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: `${err}` } };
    }
  }

  async create(request: Request): Promise<ApiRestResponse> {
    try {
      const data = await this.apiRestQueryBuilderFactory.create(request);

      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: `${err}` } };
    }
  }

  async update(request: Request): Promise<ApiRestResponse> {
    try {
      const data = await this.apiRestQueryBuilderFactory.update(request);

      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: `${err}` } };
    }
  }
}
