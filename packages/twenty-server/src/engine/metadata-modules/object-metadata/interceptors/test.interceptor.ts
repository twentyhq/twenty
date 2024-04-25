import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';

import { ConnectionType } from '@ptc-org/nestjs-query-graphql';
import { Observable, of, tap } from 'rxjs';

import { WorkspaceSchemaStorageService } from 'src/engine/api/graphql/workspace-schema-storage/workspace-schema-storage.service';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

// TODO:

// 1 - Check if object metadata items are found in redis cache
// 2 - Add relation definition where we set redis cache

@Injectable()
export class TestInterceptor implements NestInterceptor {
  constructor(
    private readonly workspaceSchemaStorageService: WorkspaceSchemaStorageService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    console.log({
      context,
    });
    console.log('Before...');

    if (context.getType<GqlContextType>() === 'graphql') {
      const request = context.getArgByIndex(2);

      const workspaceId = request?.req?.workspace?.id;
      const cacheVersion = request?.req?.cacheVersion;

      const objectMetadataCollection =
        await this.workspaceSchemaStorageService.getObjectMetadataCollection(
          workspaceId,
        );

      console.log({
        objectMetadataCollection,
      });

      // do something that is only important in the context of GraphQL requests
    }

    const contextType = context.getType();

    // const workspaceId = getExecutionContextWorkspaceId(context);

    const now = Date.now();

    return of({
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    } as ConnectionType<ObjectMetadataDTO>).pipe(
      tap(() => console.log(`After... ${Date.now() - now}ms`)),
    );
  }
}
