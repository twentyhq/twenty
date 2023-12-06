import { Injectable } from '@nestjs/common';

import { ApiRestQueryVariables } from 'src/core/api-rest/types/api-rest-query-variables.type';

@Injectable()
export class UpdateVariablesFactory {
  create(id: string, request: Request): ApiRestQueryVariables {
    return {
      id,
      data: request.body,
    };
  }
}
