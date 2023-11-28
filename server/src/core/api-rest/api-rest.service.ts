import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { Request } from 'express';

@Injectable()
export class ApiRestService {
  convertToGraphqlQuery(requestPath: string): string {
    const queryAction = requestPath.replace('/api/', '');
    if (queryAction.includes('current')) {
      return `
        query ${queryAction} {
          ${queryAction} {
            id
          }
        }
      `;
    } else {
      return `
        query ${queryAction} {
          ${queryAction} {
            edges {
              node {
                id
              }
            }
          }
        }
      `;
    }
  }
  async callGraphql(request: Request) {
    return await axios.post(
      `${request.protocol}://${request.headers.host}/graphql`,
      {
        query: this.convertToGraphqlQuery(request.path),
      },
      {
        headers: {
          authorization: `Bearer ${request.query.apiKey}`,
        },
      },
    );
  }
}
