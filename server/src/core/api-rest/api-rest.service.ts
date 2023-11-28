import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { Request } from 'express';
import { verify } from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';

@Injectable()
export class ApiRestService {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly environmentService: EnvironmentService,
  ) {}

  mapFieldMetadataToGraphQLQuery(
    objectMetadataItems,
    field,
    maxDepthForRelations = 2,
  ): any {
    if (maxDepthForRelations <= 0) {
      return '';
    }

    // TODO: parse
    const fieldType = field.type;

    const fieldIsSimpleValue = [
      'UUID',
      'TEXT',
      'PHONE',
      'DATE_TIME',
      'EMAIL',
      'NUMBER',
      'BOOLEAN',
    ].includes(fieldType);

    if (fieldIsSimpleValue) {
      return field.name;
    } else if (
      fieldType === 'RELATION' &&
      field.toRelationMetadata?.relationType === 'ONE_TO_MANY'
    ) {
      const relationMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id ===
          (field.toRelationMetadata as any)?.fromObjectMetadata?.id,
      );

      return `${field.name}
    {
      id
      ${(relationMetadataItem?.fields ?? [])
        .filter((field) => field.type !== 'RELATION')
        .map((field) =>
          this.mapFieldMetadataToGraphQLQuery(field, maxDepthForRelations - 1),
        )
        .join('\n')}
    }`;
    } else if (
      fieldType === 'RELATION' &&
      field.fromRelationMetadata?.relationType === 'ONE_TO_MANY'
    ) {
      const relationMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id ===
          (field.fromRelationMetadata as any)?.toObjectMetadata?.id,
      );

      return `${field.name}
      {
        edges {
          node {
            id
            ${(relationMetadataItem?.fields ?? [])
              .filter((field) => field.type !== 'RELATION')
              .map((field) =>
                this.mapFieldMetadataToGraphQLQuery(
                  field,
                  maxDepthForRelations - 1,
                ),
              )
              .join('\n')}
          }
        }
      }`;
    } else if (fieldType === 'LINK') {
      return `
      ${field.name}
      {
        label
        url
      }
    `;
    } else if (fieldType === 'CURRENCY') {
      return `
      ${field.name}
      {
        amountMicros
        currencyCode
      }
    `;
    } else if (fieldType === 'FULL_NAME') {
      return `
      ${field.name}
      {
        firstName
        lastName
      }
    `;
    }
  }

  async convertToGraphqlQuery(
    requestPath: string,
    workspaceId: string,
  ): Promise<string> {
    const objectMetadataItems =
      await this.objectMetadataService.getObjectMetadataFromWorkspaceId(
        workspaceId,
      );
    const queryAction = requestPath.replace('/api/', '');
    const objectMetadata = objectMetadataItems.filter(
      (object) =>
        object.nameSingular === queryAction ||
        object.namePlural === queryAction,
    );
    if (objectMetadata.length !== 1) {
      return '';
    }
    const objectMetadataItem = objectMetadata[0];

    return `
      query ${queryAction} {
        ${queryAction} {
          edges {
            node {
              id
              ${objectMetadataItem.fields
                .map((field) =>
                  this.mapFieldMetadataToGraphQLQuery(
                    objectMetadataItems,
                    field,
                  ),
                )
                .join('\n')}
            }
          }
        }
      }
    `;
  }
  async callGraphql(request: Request) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    if (!token) {
      return { data: { error: 'UNAUTHENTICATED' } };
    }
    const workspaceId = verify(
      token,
      this.environmentService.getAccessTokenSecret(),
    )['workspaceId'];
    return await axios.post(
      `${request.protocol}://${request.headers.host}/graphql`,
      {
        query: await this.convertToGraphqlQuery(request.path, workspaceId),
      },
      {
        headers: {
          authorization: request.headers.authorization,
        },
      },
    );
  }
}
