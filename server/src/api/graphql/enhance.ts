import { ClassType } from "type-graphql";
import * as tslib from "tslib";
import * as crudResolvers from "./resolvers/crud/resolvers-crud.index";
import * as argsTypes from "./resolvers/crud/args.index";
import * as actionResolvers from "./resolvers/crud/resolvers-actions.index";
import * as relationResolvers from "./resolvers/relations/resolvers.index";
import * as models from "./models";
import * as outputTypes from "./resolvers/outputs";
import * as inputTypes from "./resolvers/inputs";

export type MethodDecoratorOverrideFn = (decorators: MethodDecorator[]) => MethodDecorator[];

const crudResolversMap = {
  User: crudResolvers.UserCrudResolver,
  Workspace: crudResolvers.WorkspaceCrudResolver,
  WorkspaceMember: crudResolvers.WorkspaceMemberCrudResolver,
  Company: crudResolvers.CompanyCrudResolver,
  Person: crudResolvers.PersonCrudResolver,
  RefreshToken: crudResolvers.RefreshTokenCrudResolver
};
const actionResolversMap = {
  User: {
    aggregateUser: actionResolvers.AggregateUserResolver,
    createManyUser: actionResolvers.CreateManyUserResolver,
    createOneUser: actionResolvers.CreateOneUserResolver,
    deleteManyUser: actionResolvers.DeleteManyUserResolver,
    deleteOneUser: actionResolvers.DeleteOneUserResolver,
    findFirstUser: actionResolvers.FindFirstUserResolver,
    findFirstUserOrThrow: actionResolvers.FindFirstUserOrThrowResolver,
    users: actionResolvers.FindManyUserResolver,
    user: actionResolvers.FindUniqueUserResolver,
    getUser: actionResolvers.FindUniqueUserOrThrowResolver,
    groupByUser: actionResolvers.GroupByUserResolver,
    updateManyUser: actionResolvers.UpdateManyUserResolver,
    updateOneUser: actionResolvers.UpdateOneUserResolver,
    upsertOneUser: actionResolvers.UpsertOneUserResolver
  },
  Workspace: {
    aggregateWorkspace: actionResolvers.AggregateWorkspaceResolver,
    createManyWorkspace: actionResolvers.CreateManyWorkspaceResolver,
    createOneWorkspace: actionResolvers.CreateOneWorkspaceResolver,
    deleteManyWorkspace: actionResolvers.DeleteManyWorkspaceResolver,
    deleteOneWorkspace: actionResolvers.DeleteOneWorkspaceResolver,
    findFirstWorkspace: actionResolvers.FindFirstWorkspaceResolver,
    findFirstWorkspaceOrThrow: actionResolvers.FindFirstWorkspaceOrThrowResolver,
    workspaces: actionResolvers.FindManyWorkspaceResolver,
    workspace: actionResolvers.FindUniqueWorkspaceResolver,
    getWorkspace: actionResolvers.FindUniqueWorkspaceOrThrowResolver,
    groupByWorkspace: actionResolvers.GroupByWorkspaceResolver,
    updateManyWorkspace: actionResolvers.UpdateManyWorkspaceResolver,
    updateOneWorkspace: actionResolvers.UpdateOneWorkspaceResolver,
    upsertOneWorkspace: actionResolvers.UpsertOneWorkspaceResolver
  },
  WorkspaceMember: {
    aggregateWorkspaceMember: actionResolvers.AggregateWorkspaceMemberResolver,
    createManyWorkspaceMember: actionResolvers.CreateManyWorkspaceMemberResolver,
    createOneWorkspaceMember: actionResolvers.CreateOneWorkspaceMemberResolver,
    deleteManyWorkspaceMember: actionResolvers.DeleteManyWorkspaceMemberResolver,
    deleteOneWorkspaceMember: actionResolvers.DeleteOneWorkspaceMemberResolver,
    findFirstWorkspaceMember: actionResolvers.FindFirstWorkspaceMemberResolver,
    findFirstWorkspaceMemberOrThrow: actionResolvers.FindFirstWorkspaceMemberOrThrowResolver,
    workspaceMembers: actionResolvers.FindManyWorkspaceMemberResolver,
    workspaceMember: actionResolvers.FindUniqueWorkspaceMemberResolver,
    getWorkspaceMember: actionResolvers.FindUniqueWorkspaceMemberOrThrowResolver,
    groupByWorkspaceMember: actionResolvers.GroupByWorkspaceMemberResolver,
    updateManyWorkspaceMember: actionResolvers.UpdateManyWorkspaceMemberResolver,
    updateOneWorkspaceMember: actionResolvers.UpdateOneWorkspaceMemberResolver,
    upsertOneWorkspaceMember: actionResolvers.UpsertOneWorkspaceMemberResolver
  },
  Company: {
    aggregateCompany: actionResolvers.AggregateCompanyResolver,
    createManyCompany: actionResolvers.CreateManyCompanyResolver,
    createOneCompany: actionResolvers.CreateOneCompanyResolver,
    deleteManyCompany: actionResolvers.DeleteManyCompanyResolver,
    deleteOneCompany: actionResolvers.DeleteOneCompanyResolver,
    findFirstCompany: actionResolvers.FindFirstCompanyResolver,
    findFirstCompanyOrThrow: actionResolvers.FindFirstCompanyOrThrowResolver,
    companies: actionResolvers.FindManyCompanyResolver,
    company: actionResolvers.FindUniqueCompanyResolver,
    getCompany: actionResolvers.FindUniqueCompanyOrThrowResolver,
    groupByCompany: actionResolvers.GroupByCompanyResolver,
    updateManyCompany: actionResolvers.UpdateManyCompanyResolver,
    updateOneCompany: actionResolvers.UpdateOneCompanyResolver,
    upsertOneCompany: actionResolvers.UpsertOneCompanyResolver
  },
  Person: {
    aggregatePerson: actionResolvers.AggregatePersonResolver,
    createManyPerson: actionResolvers.CreateManyPersonResolver,
    createOnePerson: actionResolvers.CreateOnePersonResolver,
    deleteManyPerson: actionResolvers.DeleteManyPersonResolver,
    deleteOnePerson: actionResolvers.DeleteOnePersonResolver,
    findFirstPerson: actionResolvers.FindFirstPersonResolver,
    findFirstPersonOrThrow: actionResolvers.FindFirstPersonOrThrowResolver,
    people: actionResolvers.FindManyPersonResolver,
    person: actionResolvers.FindUniquePersonResolver,
    getPerson: actionResolvers.FindUniquePersonOrThrowResolver,
    groupByPerson: actionResolvers.GroupByPersonResolver,
    updateManyPerson: actionResolvers.UpdateManyPersonResolver,
    updateOnePerson: actionResolvers.UpdateOnePersonResolver,
    upsertOnePerson: actionResolvers.UpsertOnePersonResolver
  },
  RefreshToken: {
    aggregateRefreshToken: actionResolvers.AggregateRefreshTokenResolver,
    createManyRefreshToken: actionResolvers.CreateManyRefreshTokenResolver,
    createOneRefreshToken: actionResolvers.CreateOneRefreshTokenResolver,
    deleteManyRefreshToken: actionResolvers.DeleteManyRefreshTokenResolver,
    deleteOneRefreshToken: actionResolvers.DeleteOneRefreshTokenResolver,
    findFirstRefreshToken: actionResolvers.FindFirstRefreshTokenResolver,
    findFirstRefreshTokenOrThrow: actionResolvers.FindFirstRefreshTokenOrThrowResolver,
    refreshTokens: actionResolvers.FindManyRefreshTokenResolver,
    refreshToken: actionResolvers.FindUniqueRefreshTokenResolver,
    getRefreshToken: actionResolvers.FindUniqueRefreshTokenOrThrowResolver,
    groupByRefreshToken: actionResolvers.GroupByRefreshTokenResolver,
    updateManyRefreshToken: actionResolvers.UpdateManyRefreshTokenResolver,
    updateOneRefreshToken: actionResolvers.UpdateOneRefreshTokenResolver,
    upsertOneRefreshToken: actionResolvers.UpsertOneRefreshTokenResolver
  }
};
const crudResolversInfo = {
  User: ["aggregateUser", "createManyUser", "createOneUser", "deleteManyUser", "deleteOneUser", "findFirstUser", "findFirstUserOrThrow", "users", "user", "getUser", "groupByUser", "updateManyUser", "updateOneUser", "upsertOneUser"],
  Workspace: ["aggregateWorkspace", "createManyWorkspace", "createOneWorkspace", "deleteManyWorkspace", "deleteOneWorkspace", "findFirstWorkspace", "findFirstWorkspaceOrThrow", "workspaces", "workspace", "getWorkspace", "groupByWorkspace", "updateManyWorkspace", "updateOneWorkspace", "upsertOneWorkspace"],
  WorkspaceMember: ["aggregateWorkspaceMember", "createManyWorkspaceMember", "createOneWorkspaceMember", "deleteManyWorkspaceMember", "deleteOneWorkspaceMember", "findFirstWorkspaceMember", "findFirstWorkspaceMemberOrThrow", "workspaceMembers", "workspaceMember", "getWorkspaceMember", "groupByWorkspaceMember", "updateManyWorkspaceMember", "updateOneWorkspaceMember", "upsertOneWorkspaceMember"],
  Company: ["aggregateCompany", "createManyCompany", "createOneCompany", "deleteManyCompany", "deleteOneCompany", "findFirstCompany", "findFirstCompanyOrThrow", "companies", "company", "getCompany", "groupByCompany", "updateManyCompany", "updateOneCompany", "upsertOneCompany"],
  Person: ["aggregatePerson", "createManyPerson", "createOnePerson", "deleteManyPerson", "deleteOnePerson", "findFirstPerson", "findFirstPersonOrThrow", "people", "person", "getPerson", "groupByPerson", "updateManyPerson", "updateOnePerson", "upsertOnePerson"],
  RefreshToken: ["aggregateRefreshToken", "createManyRefreshToken", "createOneRefreshToken", "deleteManyRefreshToken", "deleteOneRefreshToken", "findFirstRefreshToken", "findFirstRefreshTokenOrThrow", "refreshTokens", "refreshToken", "getRefreshToken", "groupByRefreshToken", "updateManyRefreshToken", "updateOneRefreshToken", "upsertOneRefreshToken"]
};
const argsInfo = {
  AggregateUserArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyUserArgs: ["data", "skipDuplicates"],
  CreateOneUserArgs: ["data"],
  DeleteManyUserArgs: ["where"],
  DeleteOneUserArgs: ["where"],
  FindFirstUserArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstUserOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyUserArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueUserArgs: ["where"],
  FindUniqueUserOrThrowArgs: ["where"],
  GroupByUserArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyUserArgs: ["data", "where"],
  UpdateOneUserArgs: ["data", "where"],
  UpsertOneUserArgs: ["where", "create", "update"],
  AggregateWorkspaceArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyWorkspaceArgs: ["data", "skipDuplicates"],
  CreateOneWorkspaceArgs: ["data"],
  DeleteManyWorkspaceArgs: ["where"],
  DeleteOneWorkspaceArgs: ["where"],
  FindFirstWorkspaceArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstWorkspaceOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyWorkspaceArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueWorkspaceArgs: ["where"],
  FindUniqueWorkspaceOrThrowArgs: ["where"],
  GroupByWorkspaceArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyWorkspaceArgs: ["data", "where"],
  UpdateOneWorkspaceArgs: ["data", "where"],
  UpsertOneWorkspaceArgs: ["where", "create", "update"],
  AggregateWorkspaceMemberArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyWorkspaceMemberArgs: ["data", "skipDuplicates"],
  CreateOneWorkspaceMemberArgs: ["data"],
  DeleteManyWorkspaceMemberArgs: ["where"],
  DeleteOneWorkspaceMemberArgs: ["where"],
  FindFirstWorkspaceMemberArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstWorkspaceMemberOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyWorkspaceMemberArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueWorkspaceMemberArgs: ["where"],
  FindUniqueWorkspaceMemberOrThrowArgs: ["where"],
  GroupByWorkspaceMemberArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyWorkspaceMemberArgs: ["data", "where"],
  UpdateOneWorkspaceMemberArgs: ["data", "where"],
  UpsertOneWorkspaceMemberArgs: ["where", "create", "update"],
  AggregateCompanyArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyCompanyArgs: ["data", "skipDuplicates"],
  CreateOneCompanyArgs: ["data"],
  DeleteManyCompanyArgs: ["where"],
  DeleteOneCompanyArgs: ["where"],
  FindFirstCompanyArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstCompanyOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyCompanyArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueCompanyArgs: ["where"],
  FindUniqueCompanyOrThrowArgs: ["where"],
  GroupByCompanyArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyCompanyArgs: ["data", "where"],
  UpdateOneCompanyArgs: ["data", "where"],
  UpsertOneCompanyArgs: ["where", "create", "update"],
  AggregatePersonArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyPersonArgs: ["data", "skipDuplicates"],
  CreateOnePersonArgs: ["data"],
  DeleteManyPersonArgs: ["where"],
  DeleteOnePersonArgs: ["where"],
  FindFirstPersonArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstPersonOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyPersonArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniquePersonArgs: ["where"],
  FindUniquePersonOrThrowArgs: ["where"],
  GroupByPersonArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyPersonArgs: ["data", "where"],
  UpdateOnePersonArgs: ["data", "where"],
  UpsertOnePersonArgs: ["where", "create", "update"],
  AggregateRefreshTokenArgs: ["where", "orderBy", "cursor", "take", "skip"],
  CreateManyRefreshTokenArgs: ["data", "skipDuplicates"],
  CreateOneRefreshTokenArgs: ["data"],
  DeleteManyRefreshTokenArgs: ["where"],
  DeleteOneRefreshTokenArgs: ["where"],
  FindFirstRefreshTokenArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindFirstRefreshTokenOrThrowArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindManyRefreshTokenArgs: ["where", "orderBy", "cursor", "take", "skip", "distinct"],
  FindUniqueRefreshTokenArgs: ["where"],
  FindUniqueRefreshTokenOrThrowArgs: ["where"],
  GroupByRefreshTokenArgs: ["where", "orderBy", "by", "having", "take", "skip"],
  UpdateManyRefreshTokenArgs: ["data", "where"],
  UpdateOneRefreshTokenArgs: ["data", "where"],
  UpsertOneRefreshTokenArgs: ["where", "create", "update"]
};

type ResolverModelNames = keyof typeof crudResolversMap;

type ModelResolverActionNames<
  TModel extends ResolverModelNames
> = keyof typeof crudResolversMap[TModel]["prototype"];

export type ResolverActionsConfig<
  TModel extends ResolverModelNames
> = Partial<Record<ModelResolverActionNames<TModel>, MethodDecorator[] | MethodDecoratorOverrideFn>>
  & {
    _all?: MethodDecorator[];
    _query?: MethodDecorator[];
    _mutation?: MethodDecorator[];
  };

export type ResolversEnhanceMap = {
  [TModel in ResolverModelNames]?: ResolverActionsConfig<TModel>;
};

export function applyResolversEnhanceMap(
  resolversEnhanceMap: ResolversEnhanceMap,
) {
  const mutationOperationPrefixes = [
    "createOne", "createMany", "deleteOne", "updateOne", "deleteMany", "updateMany", "upsertOne"
  ];
  for (const resolversEnhanceMapKey of Object.keys(resolversEnhanceMap)) {
    const modelName = resolversEnhanceMapKey as keyof typeof resolversEnhanceMap;
    const crudTarget = crudResolversMap[modelName].prototype;
    const resolverActionsConfig = resolversEnhanceMap[modelName]!;
    const actionResolversConfig = actionResolversMap[modelName];
    const allActionsDecorators = resolverActionsConfig._all;
    const resolverActionNames = crudResolversInfo[modelName as keyof typeof crudResolversInfo];
    for (const resolverActionName of resolverActionNames) {
      const maybeDecoratorsOrFn = resolverActionsConfig[
        resolverActionName as keyof typeof resolverActionsConfig
      ] as MethodDecorator[] | MethodDecoratorOverrideFn | undefined;
      const isWriteOperation = mutationOperationPrefixes.some(prefix => resolverActionName.startsWith(prefix));
      const operationKindDecorators = isWriteOperation ? resolverActionsConfig._mutation : resolverActionsConfig._query;
      const mainDecorators = [
        ...allActionsDecorators ?? [],
        ...operationKindDecorators ?? [],
      ]
      let decorators: MethodDecorator[];
      if (typeof maybeDecoratorsOrFn === "function") {
        decorators = maybeDecoratorsOrFn(mainDecorators);
      } else {
        decorators = [...mainDecorators, ...maybeDecoratorsOrFn ?? []];
      }
      const actionTarget = (actionResolversConfig[
        resolverActionName as keyof typeof actionResolversConfig
      ] as Function).prototype;
      tslib.__decorate(decorators, crudTarget, resolverActionName, null);
      tslib.__decorate(decorators, actionTarget, resolverActionName, null);
    }
  }
}

type ArgsTypesNames = keyof typeof argsTypes;

type ArgFieldNames<TArgsType extends ArgsTypesNames> = Exclude<
  keyof typeof argsTypes[TArgsType]["prototype"],
  number | symbol
>;

type ArgFieldsConfig<
  TArgsType extends ArgsTypesNames
> = FieldsConfig<ArgFieldNames<TArgsType>>;

export type ArgConfig<TArgsType extends ArgsTypesNames> = {
  class?: ClassDecorator[];
  fields?: ArgFieldsConfig<TArgsType>;
};

export type ArgsTypesEnhanceMap = {
  [TArgsType in ArgsTypesNames]?: ArgConfig<TArgsType>;
};

export function applyArgsTypesEnhanceMap(
  argsTypesEnhanceMap: ArgsTypesEnhanceMap,
) {
  for (const argsTypesEnhanceMapKey of Object.keys(argsTypesEnhanceMap)) {
    const argsTypeName = argsTypesEnhanceMapKey as keyof typeof argsTypesEnhanceMap;
    const typeConfig = argsTypesEnhanceMap[argsTypeName]!;
    const typeClass = argsTypes[argsTypeName];
    const typeTarget = typeClass.prototype;
    applyTypeClassEnhanceConfig(
      typeConfig,
      typeClass,
      typeTarget,
      argsInfo[argsTypeName as keyof typeof argsInfo],
    );
  }
}

const relationResolversMap = {
  User: relationResolvers.UserRelationsResolver,
  Workspace: relationResolvers.WorkspaceRelationsResolver,
  WorkspaceMember: relationResolvers.WorkspaceMemberRelationsResolver,
  Company: relationResolvers.CompanyRelationsResolver,
  Person: relationResolvers.PersonRelationsResolver,
  RefreshToken: relationResolvers.RefreshTokenRelationsResolver
};
const relationResolversInfo = {
  User: ["WorkspaceMember", "companies", "RefreshTokens"],
  Workspace: ["WorkspaceMember", "companies", "people"],
  WorkspaceMember: ["user", "workspace"],
  Company: ["accountOwner", "people", "workspace"],
  Person: ["company", "workspace"],
  RefreshToken: ["user"]
};

type RelationResolverModelNames = keyof typeof relationResolversMap;

type RelationResolverActionNames<
  TModel extends RelationResolverModelNames
> = keyof typeof relationResolversMap[TModel]["prototype"];

export type RelationResolverActionsConfig<TModel extends RelationResolverModelNames>
  = Partial<Record<RelationResolverActionNames<TModel>, MethodDecorator[] | MethodDecoratorOverrideFn>>
  & { _all?: MethodDecorator[] };

export type RelationResolversEnhanceMap = {
  [TModel in RelationResolverModelNames]?: RelationResolverActionsConfig<TModel>;
};

export function applyRelationResolversEnhanceMap(
  relationResolversEnhanceMap: RelationResolversEnhanceMap,
) {
  for (const relationResolversEnhanceMapKey of Object.keys(relationResolversEnhanceMap)) {
    const modelName = relationResolversEnhanceMapKey as keyof typeof relationResolversEnhanceMap;
    const relationResolverTarget = relationResolversMap[modelName].prototype;
    const relationResolverActionsConfig = relationResolversEnhanceMap[modelName]!;
    const allActionsDecorators = relationResolverActionsConfig._all ?? [];
    const relationResolverActionNames = relationResolversInfo[modelName as keyof typeof relationResolversInfo];
    for (const relationResolverActionName of relationResolverActionNames) {
      const maybeDecoratorsOrFn = relationResolverActionsConfig[
        relationResolverActionName as keyof typeof relationResolverActionsConfig
      ] as MethodDecorator[] | MethodDecoratorOverrideFn | undefined;
      let decorators: MethodDecorator[];
      if (typeof maybeDecoratorsOrFn === "function") {
        decorators = maybeDecoratorsOrFn(allActionsDecorators);
      } else {
        decorators = [...allActionsDecorators, ...maybeDecoratorsOrFn ?? []];
      }
      tslib.__decorate(decorators, relationResolverTarget, relationResolverActionName, null);
    }
  }
}

type TypeConfig = {
  class?: ClassDecorator[];
  fields?: FieldsConfig;
};

export type PropertyDecoratorOverrideFn = (decorators: PropertyDecorator[]) => PropertyDecorator[];

type FieldsConfig<TTypeKeys extends string = string> = Partial<
  Record<TTypeKeys, PropertyDecorator[] | PropertyDecoratorOverrideFn>
> & { _all?: PropertyDecorator[] };

function applyTypeClassEnhanceConfig<
  TEnhanceConfig extends TypeConfig,
  TType extends object
>(
  enhanceConfig: TEnhanceConfig,
  typeClass: ClassType<TType>,
  typePrototype: TType,
  typeFieldNames: string[]
) {
  if (enhanceConfig.class) {
    tslib.__decorate(enhanceConfig.class, typeClass);
  }
  if (enhanceConfig.fields) {
    const allFieldsDecorators = enhanceConfig.fields._all ?? [];
    for (const typeFieldName of typeFieldNames) {
      const maybeDecoratorsOrFn = enhanceConfig.fields[
        typeFieldName
      ] as PropertyDecorator[] | PropertyDecoratorOverrideFn | undefined;
      let decorators: PropertyDecorator[];
      if (typeof maybeDecoratorsOrFn === "function") {
        decorators = maybeDecoratorsOrFn(allFieldsDecorators);
      } else {
        decorators = [...allFieldsDecorators, ...maybeDecoratorsOrFn ?? []];
      }
      tslib.__decorate(decorators, typePrototype, typeFieldName, void 0);
    }
  }
}

const modelsInfo = {
  User: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata"],
  Workspace: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName"],
  WorkspaceMember: ["id", "createdAt", "updatedAt", "deletedAt", "userId", "workspaceId"],
  Company: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwnerId", "workspaceId"],
  Person: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "companyId", "workspaceId"],
  RefreshToken: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "userId"]
};

type ModelNames = keyof typeof models;

type ModelFieldNames<TModel extends ModelNames> = Exclude<
  keyof typeof models[TModel]["prototype"],
  number | symbol
>;

type ModelFieldsConfig<TModel extends ModelNames> = FieldsConfig<
  ModelFieldNames<TModel>
>;

export type ModelConfig<TModel extends ModelNames> = {
  class?: ClassDecorator[];
  fields?: ModelFieldsConfig<TModel>;
};

export type ModelsEnhanceMap = {
  [TModel in ModelNames]?: ModelConfig<TModel>;
};

export function applyModelsEnhanceMap(modelsEnhanceMap: ModelsEnhanceMap) {
  for (const modelsEnhanceMapKey of Object.keys(modelsEnhanceMap)) {
    const modelName = modelsEnhanceMapKey as keyof typeof modelsEnhanceMap;
    const modelConfig = modelsEnhanceMap[modelName]!;
    const modelClass = models[modelName];
    const modelTarget = modelClass.prototype;
    applyTypeClassEnhanceConfig(
      modelConfig,
      modelClass,
      modelTarget,
      modelsInfo[modelName as keyof typeof modelsInfo],
    );
  }
}

const outputsInfo = {
  AggregateUser: ["_count", "_min", "_max"],
  UserGroupBy: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata", "_count", "_min", "_max"],
  AggregateWorkspace: ["_count", "_min", "_max"],
  WorkspaceGroupBy: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName", "_count", "_min", "_max"],
  AggregateWorkspaceMember: ["_count", "_min", "_max"],
  WorkspaceMemberGroupBy: ["id", "createdAt", "updatedAt", "deletedAt", "userId", "workspaceId", "_count", "_min", "_max"],
  AggregateCompany: ["_count", "_avg", "_sum", "_min", "_max"],
  CompanyGroupBy: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwnerId", "workspaceId", "_count", "_avg", "_sum", "_min", "_max"],
  AggregatePerson: ["_count", "_min", "_max"],
  PersonGroupBy: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "companyId", "workspaceId", "_count", "_min", "_max"],
  AggregateRefreshToken: ["_count", "_min", "_max"],
  RefreshTokenGroupBy: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "userId", "_count", "_min", "_max"],
  AffectedRowsOutput: ["count"],
  UserCount: ["companies", "RefreshTokens"],
  UserCountAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata", "_all"],
  UserMinAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified"],
  UserMaxAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified"],
  WorkspaceCount: ["WorkspaceMember", "companies", "people"],
  WorkspaceCountAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName", "_all"],
  WorkspaceMinAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName"],
  WorkspaceMaxAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName"],
  WorkspaceMemberCountAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "userId", "workspaceId", "_all"],
  WorkspaceMemberMinAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "userId", "workspaceId"],
  WorkspaceMemberMaxAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "userId", "workspaceId"],
  CompanyCount: ["people"],
  CompanyCountAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwnerId", "workspaceId", "_all"],
  CompanyAvgAggregate: ["employees"],
  CompanySumAggregate: ["employees"],
  CompanyMinAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwnerId", "workspaceId"],
  CompanyMaxAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwnerId", "workspaceId"],
  PersonCountAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "companyId", "workspaceId", "_all"],
  PersonMinAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "companyId", "workspaceId"],
  PersonMaxAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "companyId", "workspaceId"],
  RefreshTokenCountAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "userId", "_all"],
  RefreshTokenMinAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "userId"],
  RefreshTokenMaxAggregate: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "userId"]
};

type OutputTypesNames = keyof typeof outputTypes;

type OutputTypeFieldNames<TOutput extends OutputTypesNames> = Exclude<
  keyof typeof outputTypes[TOutput]["prototype"],
  number | symbol
>;

type OutputTypeFieldsConfig<
  TOutput extends OutputTypesNames
> = FieldsConfig<OutputTypeFieldNames<TOutput>>;

export type OutputTypeConfig<TOutput extends OutputTypesNames> = {
  class?: ClassDecorator[];
  fields?: OutputTypeFieldsConfig<TOutput>;
};

export type OutputTypesEnhanceMap = {
  [TOutput in OutputTypesNames]?: OutputTypeConfig<TOutput>;
};

export function applyOutputTypesEnhanceMap(
  outputTypesEnhanceMap: OutputTypesEnhanceMap,
) {
  for (const outputTypeEnhanceMapKey of Object.keys(outputTypesEnhanceMap)) {
    const outputTypeName = outputTypeEnhanceMapKey as keyof typeof outputTypesEnhanceMap;
    const typeConfig = outputTypesEnhanceMap[outputTypeName]!;
    const typeClass = outputTypes[outputTypeName];
    const typeTarget = typeClass.prototype;
    applyTypeClassEnhanceConfig(
      typeConfig,
      typeClass,
      typeTarget,
      outputsInfo[outputTypeName as keyof typeof outputsInfo],
    );
  }
}

const inputsInfo = {
  UserWhereInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata", "WorkspaceMember", "companies", "RefreshTokens"],
  UserOrderByWithRelationInput: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata", "WorkspaceMember", "companies", "RefreshTokens"],
  UserWhereUniqueInput: ["id", "email"],
  UserOrderByWithAggregationInput: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata", "_count", "_max", "_min"],
  UserScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata"],
  WorkspaceWhereInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName", "WorkspaceMember", "companies", "people"],
  WorkspaceOrderByWithRelationInput: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName", "WorkspaceMember", "companies", "people"],
  WorkspaceWhereUniqueInput: ["id", "domainName"],
  WorkspaceOrderByWithAggregationInput: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName", "_count", "_max", "_min"],
  WorkspaceScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName"],
  WorkspaceMemberWhereInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "userId", "workspaceId", "user", "workspace"],
  WorkspaceMemberOrderByWithRelationInput: ["id", "createdAt", "updatedAt", "deletedAt", "userId", "workspaceId", "user", "workspace"],
  WorkspaceMemberWhereUniqueInput: ["id", "userId"],
  WorkspaceMemberOrderByWithAggregationInput: ["id", "createdAt", "updatedAt", "deletedAt", "userId", "workspaceId", "_count", "_max", "_min"],
  WorkspaceMemberScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "userId", "workspaceId"],
  CompanyWhereInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwnerId", "workspaceId", "accountOwner", "people", "workspace"],
  CompanyOrderByWithRelationInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwnerId", "workspaceId", "accountOwner", "people", "workspace"],
  CompanyWhereUniqueInput: ["id"],
  CompanyOrderByWithAggregationInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwnerId", "workspaceId", "_count", "_avg", "_max", "_min", "_sum"],
  CompanyScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwnerId", "workspaceId"],
  PersonWhereInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "companyId", "workspaceId", "company", "workspace"],
  PersonOrderByWithRelationInput: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "companyId", "workspaceId", "company", "workspace"],
  PersonWhereUniqueInput: ["id"],
  PersonOrderByWithAggregationInput: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "companyId", "workspaceId", "_count", "_max", "_min"],
  PersonScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "companyId", "workspaceId"],
  RefreshTokenWhereInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "userId", "user"],
  RefreshTokenOrderByWithRelationInput: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "userId", "user"],
  RefreshTokenWhereUniqueInput: ["id"],
  RefreshTokenOrderByWithAggregationInput: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "userId", "_count", "_max", "_min"],
  RefreshTokenScalarWhereWithAggregatesInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "userId"],
  UserCreateInput: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata", "WorkspaceMember", "companies", "RefreshTokens"],
  UserUpdateInput: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata", "WorkspaceMember", "companies", "RefreshTokens"],
  UserCreateManyInput: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata"],
  UserUpdateManyMutationInput: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata"],
  WorkspaceCreateInput: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName", "WorkspaceMember", "companies", "people"],
  WorkspaceUpdateInput: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName", "WorkspaceMember", "companies", "people"],
  WorkspaceCreateManyInput: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName"],
  WorkspaceUpdateManyMutationInput: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName"],
  WorkspaceMemberCreateInput: ["id", "createdAt", "updatedAt", "deletedAt", "user", "workspace"],
  WorkspaceMemberUpdateInput: ["id", "createdAt", "updatedAt", "deletedAt", "user", "workspace"],
  WorkspaceMemberCreateManyInput: ["id", "createdAt", "updatedAt", "deletedAt", "userId", "workspaceId"],
  WorkspaceMemberUpdateManyMutationInput: ["id", "createdAt", "updatedAt", "deletedAt"],
  CompanyCreateInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwner", "people", "workspace"],
  CompanyUpdateInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwner", "people", "workspace"],
  CompanyCreateManyInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwnerId", "workspaceId"],
  CompanyUpdateManyMutationInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees"],
  PersonCreateInput: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "company", "workspace"],
  PersonUpdateInput: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "company", "workspace"],
  PersonCreateManyInput: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "companyId", "workspaceId"],
  PersonUpdateManyMutationInput: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city"],
  RefreshTokenCreateInput: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "user"],
  RefreshTokenUpdateInput: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "user"],
  RefreshTokenCreateManyInput: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "userId"],
  RefreshTokenUpdateManyMutationInput: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken"],
  StringFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "mode", "not"],
  DateTimeFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  DateTimeNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  BoolFilter: ["equals", "not"],
  StringNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "mode", "not"],
  JsonNullableFilter: ["equals", "path", "string_contains", "string_starts_with", "string_ends_with", "array_contains", "array_starts_with", "array_ends_with", "lt", "lte", "gt", "gte", "not"],
  WorkspaceMemberRelationFilter: ["is", "isNot"],
  CompanyListRelationFilter: ["every", "some", "none"],
  RefreshTokenListRelationFilter: ["every", "some", "none"],
  CompanyOrderByRelationAggregateInput: ["_count"],
  RefreshTokenOrderByRelationAggregateInput: ["_count"],
  UserCountOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata"],
  UserMaxOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified"],
  UserMinOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified"],
  StringWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "mode", "not", "_count", "_min", "_max"],
  DateTimeWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_min", "_max"],
  DateTimeNullableWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_min", "_max"],
  BoolWithAggregatesFilter: ["equals", "not", "_count", "_min", "_max"],
  StringNullableWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "mode", "not", "_count", "_min", "_max"],
  JsonNullableWithAggregatesFilter: ["equals", "path", "string_contains", "string_starts_with", "string_ends_with", "array_contains", "array_starts_with", "array_ends_with", "lt", "lte", "gt", "gte", "not", "_count", "_min", "_max"],
  WorkspaceMemberListRelationFilter: ["every", "some", "none"],
  PersonListRelationFilter: ["every", "some", "none"],
  WorkspaceMemberOrderByRelationAggregateInput: ["_count"],
  PersonOrderByRelationAggregateInput: ["_count"],
  WorkspaceCountOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName"],
  WorkspaceMaxOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName"],
  WorkspaceMinOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName"],
  UserRelationFilter: ["is", "isNot"],
  WorkspaceRelationFilter: ["is", "isNot"],
  WorkspaceMemberCountOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "userId", "workspaceId"],
  WorkspaceMemberMaxOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "userId", "workspaceId"],
  WorkspaceMemberMinOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "userId", "workspaceId"],
  IntNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  CompanyCountOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwnerId", "workspaceId"],
  CompanyAvgOrderByAggregateInput: ["employees"],
  CompanyMaxOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwnerId", "workspaceId"],
  CompanyMinOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwnerId", "workspaceId"],
  CompanySumOrderByAggregateInput: ["employees"],
  IntNullableWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_avg", "_sum", "_min", "_max"],
  CompanyRelationFilter: ["is", "isNot"],
  PersonCountOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "companyId", "workspaceId"],
  PersonMaxOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "companyId", "workspaceId"],
  PersonMinOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "companyId", "workspaceId"],
  RefreshTokenCountOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "userId"],
  RefreshTokenMaxOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "userId"],
  RefreshTokenMinOrderByAggregateInput: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "userId"],
  WorkspaceMemberCreateNestedOneWithoutUserInput: ["create", "connectOrCreate", "connect"],
  CompanyCreateNestedManyWithoutAccountOwnerInput: ["create", "connectOrCreate", "createMany", "connect"],
  RefreshTokenCreateNestedManyWithoutUserInput: ["create", "connectOrCreate", "createMany", "connect"],
  StringFieldUpdateOperationsInput: ["set"],
  DateTimeFieldUpdateOperationsInput: ["set"],
  NullableDateTimeFieldUpdateOperationsInput: ["set"],
  BoolFieldUpdateOperationsInput: ["set"],
  NullableStringFieldUpdateOperationsInput: ["set"],
  WorkspaceMemberUpdateOneWithoutUserNestedInput: ["create", "connectOrCreate", "upsert", "disconnect", "delete", "connect", "update"],
  CompanyUpdateManyWithoutAccountOwnerNestedInput: ["create", "connectOrCreate", "upsert", "createMany", "set", "disconnect", "delete", "connect", "update", "updateMany", "deleteMany"],
  RefreshTokenUpdateManyWithoutUserNestedInput: ["create", "connectOrCreate", "upsert", "createMany", "set", "disconnect", "delete", "connect", "update", "updateMany", "deleteMany"],
  WorkspaceMemberCreateNestedManyWithoutWorkspaceInput: ["create", "connectOrCreate", "createMany", "connect"],
  CompanyCreateNestedManyWithoutWorkspaceInput: ["create", "connectOrCreate", "createMany", "connect"],
  PersonCreateNestedManyWithoutWorkspaceInput: ["create", "connectOrCreate", "createMany", "connect"],
  WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput: ["create", "connectOrCreate", "upsert", "createMany", "set", "disconnect", "delete", "connect", "update", "updateMany", "deleteMany"],
  CompanyUpdateManyWithoutWorkspaceNestedInput: ["create", "connectOrCreate", "upsert", "createMany", "set", "disconnect", "delete", "connect", "update", "updateMany", "deleteMany"],
  PersonUpdateManyWithoutWorkspaceNestedInput: ["create", "connectOrCreate", "upsert", "createMany", "set", "disconnect", "delete", "connect", "update", "updateMany", "deleteMany"],
  UserCreateNestedOneWithoutWorkspaceMemberInput: ["create", "connectOrCreate", "connect"],
  WorkspaceCreateNestedOneWithoutWorkspaceMemberInput: ["create", "connectOrCreate", "connect"],
  UserUpdateOneRequiredWithoutWorkspaceMemberNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  UserCreateNestedOneWithoutCompaniesInput: ["create", "connectOrCreate", "connect"],
  PersonCreateNestedManyWithoutCompanyInput: ["create", "connectOrCreate", "createMany", "connect"],
  WorkspaceCreateNestedOneWithoutCompaniesInput: ["create", "connectOrCreate", "connect"],
  NullableIntFieldUpdateOperationsInput: ["set", "increment", "decrement", "multiply", "divide"],
  UserUpdateOneWithoutCompaniesNestedInput: ["create", "connectOrCreate", "upsert", "disconnect", "delete", "connect", "update"],
  PersonUpdateManyWithoutCompanyNestedInput: ["create", "connectOrCreate", "upsert", "createMany", "set", "disconnect", "delete", "connect", "update", "updateMany", "deleteMany"],
  WorkspaceUpdateOneRequiredWithoutCompaniesNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  CompanyCreateNestedOneWithoutPeopleInput: ["create", "connectOrCreate", "connect"],
  WorkspaceCreateNestedOneWithoutPeopleInput: ["create", "connectOrCreate", "connect"],
  CompanyUpdateOneWithoutPeopleNestedInput: ["create", "connectOrCreate", "upsert", "disconnect", "delete", "connect", "update"],
  WorkspaceUpdateOneRequiredWithoutPeopleNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  UserCreateNestedOneWithoutRefreshTokensInput: ["create", "connectOrCreate", "connect"],
  UserUpdateOneRequiredWithoutRefreshTokensNestedInput: ["create", "connectOrCreate", "upsert", "connect", "update"],
  NestedStringFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "not"],
  NestedDateTimeFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  NestedDateTimeNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  NestedBoolFilter: ["equals", "not"],
  NestedStringNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "not"],
  NestedStringWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "not", "_count", "_min", "_max"],
  NestedIntFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  NestedDateTimeWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_min", "_max"],
  NestedDateTimeNullableWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_min", "_max"],
  NestedIntNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  NestedBoolWithAggregatesFilter: ["equals", "not", "_count", "_min", "_max"],
  NestedStringNullableWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "not", "_count", "_min", "_max"],
  NestedJsonNullableFilter: ["equals", "path", "string_contains", "string_starts_with", "string_ends_with", "array_contains", "array_starts_with", "array_ends_with", "lt", "lte", "gt", "gte", "not"],
  NestedIntNullableWithAggregatesFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not", "_count", "_avg", "_sum", "_min", "_max"],
  NestedFloatNullableFilter: ["equals", "in", "notIn", "lt", "lte", "gt", "gte", "not"],
  WorkspaceMemberCreateWithoutUserInput: ["id", "createdAt", "updatedAt", "deletedAt", "workspace"],
  WorkspaceMemberCreateOrConnectWithoutUserInput: ["where", "create"],
  CompanyCreateWithoutAccountOwnerInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "people", "workspace"],
  CompanyCreateOrConnectWithoutAccountOwnerInput: ["where", "create"],
  CompanyCreateManyAccountOwnerInputEnvelope: ["data", "skipDuplicates"],
  RefreshTokenCreateWithoutUserInput: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken"],
  RefreshTokenCreateOrConnectWithoutUserInput: ["where", "create"],
  RefreshTokenCreateManyUserInputEnvelope: ["data", "skipDuplicates"],
  WorkspaceMemberUpsertWithoutUserInput: ["update", "create"],
  WorkspaceMemberUpdateWithoutUserInput: ["id", "createdAt", "updatedAt", "deletedAt", "workspace"],
  CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput: ["where", "update", "create"],
  CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput: ["where", "data"],
  CompanyUpdateManyWithWhereWithoutAccountOwnerInput: ["where", "data"],
  CompanyScalarWhereInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwnerId", "workspaceId"],
  RefreshTokenUpsertWithWhereUniqueWithoutUserInput: ["where", "update", "create"],
  RefreshTokenUpdateWithWhereUniqueWithoutUserInput: ["where", "data"],
  RefreshTokenUpdateManyWithWhereWithoutUserInput: ["where", "data"],
  RefreshTokenScalarWhereInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "refreshToken", "userId"],
  WorkspaceMemberCreateWithoutWorkspaceInput: ["id", "createdAt", "updatedAt", "deletedAt", "user"],
  WorkspaceMemberCreateOrConnectWithoutWorkspaceInput: ["where", "create"],
  WorkspaceMemberCreateManyWorkspaceInputEnvelope: ["data", "skipDuplicates"],
  CompanyCreateWithoutWorkspaceInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwner", "people"],
  CompanyCreateOrConnectWithoutWorkspaceInput: ["where", "create"],
  CompanyCreateManyWorkspaceInputEnvelope: ["data", "skipDuplicates"],
  PersonCreateWithoutWorkspaceInput: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "company"],
  PersonCreateOrConnectWithoutWorkspaceInput: ["where", "create"],
  PersonCreateManyWorkspaceInputEnvelope: ["data", "skipDuplicates"],
  WorkspaceMemberUpsertWithWhereUniqueWithoutWorkspaceInput: ["where", "update", "create"],
  WorkspaceMemberUpdateWithWhereUniqueWithoutWorkspaceInput: ["where", "data"],
  WorkspaceMemberUpdateManyWithWhereWithoutWorkspaceInput: ["where", "data"],
  WorkspaceMemberScalarWhereInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "userId", "workspaceId"],
  CompanyUpsertWithWhereUniqueWithoutWorkspaceInput: ["where", "update", "create"],
  CompanyUpdateWithWhereUniqueWithoutWorkspaceInput: ["where", "data"],
  CompanyUpdateManyWithWhereWithoutWorkspaceInput: ["where", "data"],
  PersonUpsertWithWhereUniqueWithoutWorkspaceInput: ["where", "update", "create"],
  PersonUpdateWithWhereUniqueWithoutWorkspaceInput: ["where", "data"],
  PersonUpdateManyWithWhereWithoutWorkspaceInput: ["where", "data"],
  PersonScalarWhereInput: ["AND", "OR", "NOT", "id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "companyId", "workspaceId"],
  UserCreateWithoutWorkspaceMemberInput: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata", "companies", "RefreshTokens"],
  UserCreateOrConnectWithoutWorkspaceMemberInput: ["where", "create"],
  WorkspaceCreateWithoutWorkspaceMemberInput: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName", "companies", "people"],
  WorkspaceCreateOrConnectWithoutWorkspaceMemberInput: ["where", "create"],
  UserUpsertWithoutWorkspaceMemberInput: ["update", "create"],
  UserUpdateWithoutWorkspaceMemberInput: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata", "companies", "RefreshTokens"],
  WorkspaceUpsertWithoutWorkspaceMemberInput: ["update", "create"],
  WorkspaceUpdateWithoutWorkspaceMemberInput: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName", "companies", "people"],
  UserCreateWithoutCompaniesInput: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata", "WorkspaceMember", "RefreshTokens"],
  UserCreateOrConnectWithoutCompaniesInput: ["where", "create"],
  PersonCreateWithoutCompanyInput: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "workspace"],
  PersonCreateOrConnectWithoutCompanyInput: ["where", "create"],
  PersonCreateManyCompanyInputEnvelope: ["data", "skipDuplicates"],
  WorkspaceCreateWithoutCompaniesInput: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName", "WorkspaceMember", "people"],
  WorkspaceCreateOrConnectWithoutCompaniesInput: ["where", "create"],
  UserUpsertWithoutCompaniesInput: ["update", "create"],
  UserUpdateWithoutCompaniesInput: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata", "WorkspaceMember", "RefreshTokens"],
  PersonUpsertWithWhereUniqueWithoutCompanyInput: ["where", "update", "create"],
  PersonUpdateWithWhereUniqueWithoutCompanyInput: ["where", "data"],
  PersonUpdateManyWithWhereWithoutCompanyInput: ["where", "data"],
  WorkspaceUpsertWithoutCompaniesInput: ["update", "create"],
  WorkspaceUpdateWithoutCompaniesInput: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName", "WorkspaceMember", "people"],
  CompanyCreateWithoutPeopleInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwner", "workspace"],
  CompanyCreateOrConnectWithoutPeopleInput: ["where", "create"],
  WorkspaceCreateWithoutPeopleInput: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName", "WorkspaceMember", "companies"],
  WorkspaceCreateOrConnectWithoutPeopleInput: ["where", "create"],
  CompanyUpsertWithoutPeopleInput: ["update", "create"],
  CompanyUpdateWithoutPeopleInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwner", "workspace"],
  WorkspaceUpsertWithoutPeopleInput: ["update", "create"],
  WorkspaceUpdateWithoutPeopleInput: ["id", "createdAt", "updatedAt", "deletedAt", "domainName", "displayName", "WorkspaceMember", "companies"],
  UserCreateWithoutRefreshTokensInput: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata", "WorkspaceMember", "companies"],
  UserCreateOrConnectWithoutRefreshTokensInput: ["where", "create"],
  UserUpsertWithoutRefreshTokensInput: ["update", "create"],
  UserUpdateWithoutRefreshTokensInput: ["id", "createdAt", "updatedAt", "deletedAt", "lastSeen", "disabled", "displayName", "email", "avatarUrl", "locale", "phoneNumber", "passwordHash", "emailVerified", "metadata", "WorkspaceMember", "companies"],
  CompanyCreateManyAccountOwnerInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "workspaceId"],
  RefreshTokenCreateManyUserInput: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken"],
  CompanyUpdateWithoutAccountOwnerInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "people", "workspace"],
  RefreshTokenUpdateWithoutUserInput: ["id", "createdAt", "updatedAt", "deletedAt", "refreshToken"],
  WorkspaceMemberCreateManyWorkspaceInput: ["id", "createdAt", "updatedAt", "deletedAt", "userId"],
  CompanyCreateManyWorkspaceInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwnerId"],
  PersonCreateManyWorkspaceInput: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "companyId"],
  WorkspaceMemberUpdateWithoutWorkspaceInput: ["id", "createdAt", "updatedAt", "deletedAt", "user"],
  CompanyUpdateWithoutWorkspaceInput: ["id", "createdAt", "updatedAt", "deletedAt", "name", "domainName", "address", "employees", "accountOwner", "people"],
  PersonUpdateWithoutWorkspaceInput: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "company"],
  PersonCreateManyCompanyInput: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "workspaceId"],
  PersonUpdateWithoutCompanyInput: ["id", "createdAt", "updatedAt", "deletedAt", "firstname", "lastname", "email", "phone", "city", "workspace"]
};

type InputTypesNames = keyof typeof inputTypes;

type InputTypeFieldNames<TInput extends InputTypesNames> = Exclude<
  keyof typeof inputTypes[TInput]["prototype"],
  number | symbol
>;

type InputTypeFieldsConfig<
  TInput extends InputTypesNames
> = FieldsConfig<InputTypeFieldNames<TInput>>;

export type InputTypeConfig<TInput extends InputTypesNames> = {
  class?: ClassDecorator[];
  fields?: InputTypeFieldsConfig<TInput>;
};

export type InputTypesEnhanceMap = {
  [TInput in InputTypesNames]?: InputTypeConfig<TInput>;
};

export function applyInputTypesEnhanceMap(
  inputTypesEnhanceMap: InputTypesEnhanceMap,
) {
  for (const inputTypeEnhanceMapKey of Object.keys(inputTypesEnhanceMap)) {
    const inputTypeName = inputTypeEnhanceMapKey as keyof typeof inputTypesEnhanceMap;
    const typeConfig = inputTypesEnhanceMap[inputTypeName]!;
    const typeClass = inputTypes[inputTypeName];
    const typeTarget = typeClass.prototype;
    applyTypeClassEnhanceConfig(
      typeConfig,
      typeClass,
      typeTarget,
      inputsInfo[inputTypeName as keyof typeof inputsInfo],
    );
  }
}

