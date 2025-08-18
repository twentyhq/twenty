import { Injectable,NestMiddleware } from '@nestjs/common';
import { NextFunction,Request,Response } from 'express';
import { GraphQLRequestCustomService } from './graphql-request-custom.service';

@Injectable()
export class GraphQLRequestCustomMiddleware implements NestMiddleware {
  constructor(private readonly customService: GraphQLRequestCustomService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // only process for GraphQL requests
      if (req.path === '/graphql' && req.method === 'POST') {
        await this.customizeGraphQLRequest(req);
      }
    } catch (error) {
      console.error('Error in GraphQL request customization middleware:', error);
    }

    next();
  }

  private async customizeGraphQLRequest(req: Request): Promise<void> {
    // read body of request
    const body = req.body;
    if (!body || !body.variables || !body.variables.input) {
      console.log('⚠️ No input variables found, skipping customization');
      return;
    }

    const input = body.variables.input;
    const operationName = body.operationName;
    
    // extract operation name from query if not in body
    let detectedOperationName = operationName;
    if (!operationName && body.query) {
      const queryMatch = body.query.match(/mutation\s+(\w+)/);
      if (queryMatch) {
        detectedOperationName = queryMatch[1];
      }
    }

    // get authorization header from request
    const authorizationHeader = req.headers.authorization;

    // use: new method of service with authorization header
    await this.customService.customizeGraphQLRequest(detectedOperationName, body.variables, authorizationHeader);
  }

}
