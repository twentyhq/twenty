import { Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';

import { MktInvoiceService } from 'src/mkt-core/invoice/mkt-invoice.service';

@Injectable()
export class MktInvoiceMiddleware implements NestMiddleware {
  constructor(private readonly mktInvoiceService: MktInvoiceService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.path === '/graphql' && req.method === 'POST') {
        await this.customizeGraphQLRequest(req);
      }
    } catch (error) {
      console.error(
        'Error in GraphQL request customization middleware:',
        error,
      );
    }

    next();
  }

  private async customizeGraphQLRequest(req: Request): Promise<void> {
    const body = req.body;

    if (!body || !body.variables) {
      return;
    }

    const operationName = body.operationName;

    let detectedOperationName = operationName;

    if (!operationName && body.query) {
      const queryMatch = body.query.match(/mutation\s+(\w+)/);

      if (queryMatch) {
        detectedOperationName = queryMatch[1];
      }
    }

    await this.mktInvoiceService.customizeGraphQLRequest(
      detectedOperationName,
      body.variables,
    );
  }
}
