import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { Request } from 'express';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { ApiRestQueryBuilderFactory } from 'src/core/api-rest/api-rest-query-builder/api-rest-query-builder.factory';
import { TokenService } from 'src/core/auth/services/token.service';

@Injectable()
export class ApiRestService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly environmentService: EnvironmentService,
    private readonly apiRestQueryBuilderFactory: ApiRestQueryBuilderFactory,
  ) {}

  async callGraphql(request: Request, data) {
    return await axios.post(
      `${request.protocol}://${request.get('host')}/graphql`,
      data,
      {
        headers: {
          Authorization: request.headers.authorization,
        },
      },
    );
  }

  async get(request: Request) {
    try {
      const data = await this.apiRestQueryBuilderFactory.get(request);
      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: `${err}` } };
    }
  }

  async delete(request: Request) {
    try {
      const data = await this.apiRestQueryBuilderFactory.delete(request);
      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: `${err}` } };
    }
  }

  async create(request: Request) {
    try {
      const data = await this.apiRestQueryBuilderFactory.create(request);
      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: `${err}` } };
    }
  }

  async update(request: Request) {
    try {
      const data = await this.apiRestQueryBuilderFactory.update(request);
      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: `${err}` } };
    }
  }
}
