import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { TokenService } from 'src/core/auth/services/token.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class OpenApiService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async generateSchema(request: Request) {
    const workspace = await this.tokenService.validateToken(request);

    const objectMetadataItems =
      await this.objectMetadataService.findManyWithinWorkspace(workspace.id);

    if (!objectMetadataItems.length) {
      throw new BadRequestException(`No object found`);
    }

    console.log(objectMetadataItems);

    return {
      openapi: '3.0.3',
      info: {
        title: 'Twenty Api',
        description: `This is a twenty REST/API playground based on the OpenAPI 3.0 specification.\n\nTo use the Playground, please log to your twenty account and generate an API key here: here: ${this.environmentService.getFrontBaseUrl()}/settings/developers/api-keys`,
        termsOfService: 'https://github.com/twentyhq/twenty?tab=coc-ov-file',
        contact: {
          email: 'felix@twenty.com',
        },
        license: {
          name: 'AGPL-3.0',
          url: 'https://github.com/twentyhq/twenty?tab=AGPL-3.0-1-ov-file#readme',
        },
        version: '0.2.0',
      },
      externalDocs: {
        description: 'Find out more about Twenty',
        url: 'http://twenty.com',
      },
      tags: [
        {
          name: 'companies',
          description: 'Everything about your Companies',
        },
      ],
      paths: {
        '/companies': {
          get: {
            tags: ['companies'],
            summary: 'Find Many companies',
            description:
              'order_by, filter, limit or last_cursor can be provided to request your companies',
            operationId: 'findManyCompanies',
            parameters: [
              {
                name: 'limit',
                in: 'query',
                description:
                  'Integer value to limit the number of companies returned',
                required: false,
                schema: {
                  type: 'integer',
                  format: 'int64',
                  minimum: 0,
                  maximum: 60,
                  default: 60,
                },
              },
            ],
            responses: {
              '200': {
                description: 'successful operation',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  }
}
