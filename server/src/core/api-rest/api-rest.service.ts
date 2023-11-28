import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { Request } from 'express';

@Injectable()
export class ApiRestService {
  async callGraphql(request: Request) {
    return await axios.post(
      `${request.protocol}://${request.headers.host}/graphql`,
      {
        query: `
        query CurrentWorkspace {
          currentWorkspace {
            id
          }
        }
      `,
      },
      {
        headers: {
          authorization: `Bearer ${request.query.apiKey}`,
        },
      },
    );
  }
}
