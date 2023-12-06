import { Injectable } from '@nestjs/common';

import { ApiRestQueryVariables } from 'src/core/api-rest/types/api-rest-query-variables.type';

@Injectable()
export class CreateVariablesFactory {
  create(request: Request): ApiRestQueryVariables {
    return {
      data: request.body,
    };
  }
}
