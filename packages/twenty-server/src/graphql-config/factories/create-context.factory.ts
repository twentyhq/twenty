import { Injectable } from '@nestjs/common';

import { YogaDriverServerContext } from '@graphql-yoga/nestjs';

import { GraphQLContext } from 'src/graphql-config/interfaces/graphql-context.interface';

import { TokenService } from 'src/core/auth/services/token.service';

@Injectable()
export class CreateContextFactory {
  constructor(private readonly tokenService: TokenService) {}

  async create(
    context: YogaDriverServerContext<'express'>,
  ): Promise<GraphQLContext> {
    // Check if token is present in the request
    if (this.tokenService.isTokenPresent(context.req)) {
      const data = await this.tokenService.validateToken(context.req);

      // Inject user and workspace into the context
      return { ...context, ...data };
    }

    return context;
  }
}
