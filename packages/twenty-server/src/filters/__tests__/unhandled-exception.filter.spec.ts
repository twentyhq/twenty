// oxlint-disable twenty/graphql-resolvers-should-be-guarded
import {
  type CanActivate,
  Catch,
  type ExceptionFilter,
  Injectable,
  Module,
  UseGuards,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import {
  GraphQLModule,
  GraphQLSchemaHost,
  type GraphQLSchemaHost as GraphQLSchemaHostType,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { Test } from '@nestjs/testing';

import { YogaDriver, type YogaDriverConfig } from '@graphql-yoga/nestjs';
import { msg } from '@lingui/core/macro';
import { type GraphQLSchema, graphql } from 'graphql';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  ErrorCode,
  ForbiddenError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { CustomExceptionFilter } from 'src/filters/custom-exception.filter';
import { UnhandledExceptionFilter } from 'src/filters/unhandled-exception.filter';

@Injectable()
class DenyPermissionGuard implements CanActivate {
  canActivate(): boolean {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
      { userFriendlyMessage: msg`denied` },
    );
  }
}

@Catch(PermissionsException)
class TypedPermissionsGraphqlFilter implements ExceptionFilter {
  catch(exception: PermissionsException) {
    return new ForbiddenError(exception);
  }
}

@Resolver()
class TestResolver {
  @Query(() => String)
  ping(): string {
    return 'pong';
  }

  @Mutation(() => String)
  @UseGuards(DenyPermissionGuard)
  guardedMutation(): string {
    return 'ok';
  }
}

// mirrors CoreEngineModule / MetadataEngineModule: a feature module that
// registers a typed GraphQL exception filter
@Module({
  providers: [
    TestResolver,
    { provide: APP_FILTER, useClass: TypedPermissionsGraphqlFilter },
  ],
})
class FeatureModule {}

@Module({
  imports: [
    GraphQLModule.forRoot<YogaDriverConfig>({
      driver: YogaDriver,
      autoSchemaFile: true,
    }),
    FeatureModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: UnhandledExceptionFilter }],
})
class RootModuleWithAppFilter {}

@Module({
  imports: [
    GraphQLModule.forRoot<YogaDriverConfig>({
      driver: YogaDriver,
      autoSchemaFile: true,
    }),
    FeatureModule,
  ],
})
class RootModuleWithoutAppFilter {}

@Module({
  providers: [TestResolver],
})
class FeatureModuleWithoutTypedFilter {}

@Module({
  imports: [
    GraphQLModule.forRoot<YogaDriverConfig>({
      driver: YogaDriver,
      autoSchemaFile: true,
    }),
    FeatureModuleWithoutTypedFilter,
  ],
  providers: [
    { provide: APP_FILTER, useClass: UnhandledExceptionFilter },
    { provide: APP_FILTER, useClass: CustomExceptionFilter },
    { provide: ExceptionHandlerService, useValue: {} },
  ],
})
class RootModuleWithCustomExceptionFilter {}

const buildSchema = async (
  rootModule: unknown,
  registerFilterAtBootstrap: boolean,
) => {
  const moduleRef = await Test.createTestingModule({
    // oxlint-disable-next-line typescript/no-explicit-any
    imports: [rootModule as any],
  }).compile();

  const app = moduleRef.createNestApplication();

  if (registerFilterAtBootstrap) {
    app.useGlobalFilters(new UnhandledExceptionFilter());
  }

  await app.init();

  const schema = app.get<GraphQLSchemaHostType>(GraphQLSchemaHost).schema;

  return { app, schema };
};

const runGuardedMutation = (schema: GraphQLSchema) =>
  graphql({ schema, source: 'mutation { guardedMutation }' });

describe('UnhandledExceptionFilter global registration', () => {
  it('lets typed GraphQL filters convert the exception when registered through APP_FILTER on the root module', async () => {
    const { app, schema } = await buildSchema(RootModuleWithAppFilter, false);

    const result = await runGuardedMutation(schema);

    expect(result.errors?.[0]?.extensions?.code).toBe(ErrorCode.FORBIDDEN);
    expect(result.errors?.[0]?.message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );

    await app.close();
  });

  // guards against reintroducing app.useGlobalFilters(new UnhandledExceptionFilter()):
  // Nest checks global filters in reverse registration order and selects a single
  // one, so a catch-all registered after bootstrap shadows every typed filter
  it('shadows typed GraphQL filters when registered through app.useGlobalFilters', async () => {
    const { app, schema } = await buildSchema(RootModuleWithoutAppFilter, true);

    const result = await runGuardedMutation(schema);

    expect(result.errors?.[0]?.extensions?.code).toBeUndefined();
    expect(result.errors?.[0]?.originalError).toBeInstanceOf(
      PermissionsException,
    );

    await app.close();
  });

  // the GraphQL error hook converts it by category; the filter only keeps Nest from logging it
  it('hands CustomExceptions to the GraphQL layer untouched when CustomExceptionFilter is registered after the catch-all', async () => {
    const { app, schema } = await buildSchema(
      RootModuleWithCustomExceptionFilter,
      false,
    );

    const result = await runGuardedMutation(schema);

    expect(result.errors?.[0]?.originalError).toBeInstanceOf(
      PermissionsException,
    );

    await app.close();
  });
});
