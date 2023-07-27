import { Prisma, PrismaClient } from '@prisma/client';
import { subject } from '@casl/ability';

import { camelCase } from 'src/utils/camel-case';
import { CompanyWhereInput } from 'src/core/@generated/company/company-where.input';
import { CompanyWhereUniqueInput } from 'src/core/@generated/company/company-where-unique.input';

import { AppAbility } from './ability.factory';
import { AbilityAction } from './ability.action';

type OperationType =
  | 'create'
  | 'connectOrCreate'
  | 'upsert'
  | 'createMany'
  | 'set'
  | 'disconnect'
  | 'delete'
  | 'connect'
  | 'update'
  | 'updateMany'
  | 'deleteMany';

// in most case unique identifier is the id, but it can be something else...

type OperationAbilityChecker = (
  modelName: Prisma.ModelName,
  ability: AppAbility,
  prisma: PrismaClient,
  data: any,
) => Promise<boolean>;

const createAbilityCheck: OperationAbilityChecker = async (
  modelName,
  ability,
  prisma,
  data,
) => {
  // Handle all operations cases
  const items = data?.data
    ? !Array.isArray(data.data)
      ? [data.data]
      : data.data
    : !Array.isArray(data)
    ? [data]
    : data;

  // Check if user try to create an element that is not allowed to create
  for (const {} of items) {
    if (!ability.can(AbilityAction.Create, modelName)) {
      return false;
    }
  }

  return true;
};

const simpleAbilityCheck: OperationAbilityChecker = async (
  modelName,
  ability,
  prisma,
  data,
) => {
  // Extract entity name from model name
  const entity = camelCase(modelName);
  // Handle all operations cases
  const operations = !Array.isArray(data) ? [data] : data;
  // Handle where case
  const normalizedOperations = operations.map((op) =>
    op.where ? op.where : op,
  );
  // Force entity type because of Prisma typing
  const items = await prisma[entity as string].findMany({
    where: {
      OR: normalizedOperations,
    },
  });

  // Check if user try to connect an element that is not allowed to read
  for (const item of items) {
    // TODO: Replace user by workspaceMember and remove this check
    if (
      modelName === 'User' ||
      modelName === 'UserSettings' ||
      modelName === 'Workspace'
    ) {
      return true;
    }

    if (!ability.can(AbilityAction.Read, subject(modelName, item))) {
      return false;
    }
  }

  return true;
};

const operationAbilityCheckers: Record<OperationType, OperationAbilityChecker> =
  {
    create: createAbilityCheck,
    createMany: createAbilityCheck,
    upsert: simpleAbilityCheck,
    update: simpleAbilityCheck,
    updateMany: simpleAbilityCheck,
    delete: simpleAbilityCheck,
    deleteMany: simpleAbilityCheck,
    connectOrCreate: simpleAbilityCheck,
    connect: simpleAbilityCheck,
    disconnect: simpleAbilityCheck,
    set: simpleAbilityCheck,
  };

// Check relation nested abilities
export async function relationAbilityChecker(
  modelName: Prisma.ModelName,
  ability: AppAbility,
  prisma: PrismaClient,
  args: any,
) {
  // Extract models from Prisma
  const models = Prisma.dmmf.datamodel.models;
  // Find main model from options
  const mainModel = models.find((item) => item.name === modelName);

  if (!mainModel) {
    throw new Error('Main model not found');
  }

  // Loop over fields
  for (const field of mainModel.fields) {
    // Check if field is a relation
    if (field.relationName) {
      // Check if field is in args
      const operation = args.data?.[field.name] ?? args?.[field.name];

      if (operation) {
        // Extract operation name and value
        const operationType = Object.keys(operation)[0] as OperationType;
        const operationValue = operation[operationType];

        // Get operation checker for the operation type
        const operationChecker = operationAbilityCheckers[operationType];

        if (!operationChecker) {
          throw new Error('Operation not found');
        }

        // Check if operation is allowed
        const allowed = await operationChecker(
          field.type as Prisma.ModelName,
          ability,
          prisma,
          operationValue,
        );

        if (!allowed) {
          return false;
        }

        // For the 'create', 'connectOrCreate', 'upsert', 'update', and 'updateMany' operations,
        // we should also check the nested operations.
        if (
          [
            'create',
            'connectOrCreate',
            'upsert',
            'update',
            'updateMany',
          ].includes(operationType)
        ) {
          // Handle nested operations all cases

          const operationValues = !Array.isArray(operationValue)
            ? [operationValue]
            : operationValue;

          // Loop over nested args
          for (const nestedArgs of operationValues) {
            const nestedCreateAllowed = await relationAbilityChecker(
              field.type as Prisma.ModelName,
              ability,
              prisma,
              nestedArgs.create ?? nestedArgs.data ?? nestedArgs,
            );

            if (!nestedCreateAllowed) {
              return false;
            }

            if (nestedArgs.update) {
              const nestedUpdateAllowed = await relationAbilityChecker(
                field.type as Prisma.ModelName,
                ability,
                prisma,
                nestedArgs.update,
              );

              if (!nestedUpdateAllowed) {
                return false;
              }
            }
          }
        }
      }
    }
  }

  return true;
}

const isWhereInput = (input: any): boolean => {
  return Object.values(input).some((value) => typeof value === 'object');
};

type ExcludeUnique<T> = T extends infer U
  ? 'AND' extends keyof U
    ? U
    : never
  : never;

/**
 * Convert a where unique input to a where input prisma
 * @param args Can be a where unique input or a where input
 * @returns whare input
 */
export const convertToWhereInput = <T>(
  where: T | undefined,
): ExcludeUnique<T> | undefined => {
  const input = where as any;

  if (!input) {
    return input;
  }

  // If it's already a WhereInput, return it directly
  if (isWhereInput(input)) {
    return input;
  }

  // If not convert it to a WhereInput
  const whereInput = {};

  for (const key in input) {
    whereInput[key] = { equals: input[key] };
  }

  return whereInput as ExcludeUnique<T>;
};
