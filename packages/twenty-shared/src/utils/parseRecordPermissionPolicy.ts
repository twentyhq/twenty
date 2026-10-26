import { RECORD_PERMISSION_ACTIONS } from '@/constants/RecordPermissionActions';
import { RecordShareAccessLevel } from '@/types/RecordShareAccessLevel';
import { RowLevelPermissionPredicateOperand } from '@/types/RowLevelPermissionPredicateOperand';
import {
  type RecordPermissionCondition,
  type RecordPermissionPolicyDefinition,
} from '@/types/RecordPermissionPolicy';
import { z } from 'zod';

const conditionSchema: z.ZodType<RecordPermissionCondition> = z.lazy(() =>
  z.union([
    z
      .object({
        kind: z.literal('predicate'),
        fieldUniversalIdentifier: z.string().uuid(),
        operand: z.nativeEnum(RowLevelPermissionPredicateOperand),
        value: z.union([
          z.string(),
          z.array(z.string()),
          z.number().finite(),
          z.boolean(),
          z.record(z.string(), z.unknown()),
          z.null(),
        ]),
        subFieldName: z.string().max(100).nullish(),
        memberFieldUniversalIdentifier: z.string().uuid().nullish(),
        memberSubFieldName: z.string().max(100).nullish(),
      })
      .strict(),
    z
      .object({
        kind: z.enum(['all', 'any']),
        conditions: z.array(conditionSchema).min(1).max(100),
      })
      .strict(),
  ]),
);

const ruleSchema = z
  .object({
    universalIdentifier: z.string().uuid(),
    label: z.string().trim().min(1).max(200),
    roleUniversalIdentifier: z.string().uuid(),
    actions: z
      .array(z.enum(RECORD_PERMISSION_ACTIONS))
      .min(1)
      .max(RECORD_PERMISSION_ACTIONS.length),
    condition: conditionSchema.nullable(),
    shareAccessLevel: z
      .enum([
        RecordShareAccessLevel.READ,
        RecordShareAccessLevel.READ_WRITE,
        RecordShareAccessLevel.FULL,
      ])
      .optional(),
  })
  .strict();

const policySchema = z
  .object({
    version: z.literal(1),
    defaults: z
      .array(ruleSchema.extend({ condition: z.null() }))
      .max(1000)
      .optional(),
    objects: z
      .array(
        z
          .object({
            objectUniversalIdentifier: z.string().uuid(),
            rules: z.array(ruleSchema).max(1000),
            defaultOverrideRoleUniversalIdentifiers: z
              .array(z.string().uuid())
              .max(1000)
              .optional(),
            inheritancePaths: z
              .array(
                z
                  .object({
                    universalIdentifier: z.string().uuid(),
                    sourceObjectUniversalIdentifier: z.string().uuid(),
                    fieldUniversalIdentifiers: z
                      .array(z.string().uuid())
                      .min(1)
                      .max(3),
                  })
                  .strict(),
              )
              .max(100),
          })
          .strict(),
      )
      .min(1)
      .max(1000),
  })
  .strict();

export const parseRecordPermissionPolicy = (
  input: unknown,
): RecordPermissionPolicyDefinition => {
  let inspectedNodes = 0;
  const inspectDepth = (value: unknown, depth: number): void => {
    if (++inspectedNodes > 100000)
      throw new Error('Permission policy is too complex');
    if (depth > 24) {
      throw new Error('Permission conditions are nested too deeply');
    }
    if (typeof value === 'object' && value !== null) {
      for (const child of Object.values(value)) {
        inspectDepth(child, depth + 1);
      }
    }
  };

  inspectDepth(input, 0);
  const definition = policySchema.parse(input);
  const identifiers = [
    ...(definition.defaults ?? []).map((rule) => rule.universalIdentifier),
    ...definition.objects.flatMap((object) => [
      object.objectUniversalIdentifier,
      ...object.rules.map((rule) => rule.universalIdentifier),
      ...object.inheritancePaths.map((path) => path.universalIdentifier),
    ]),
  ];

  if (new Set(identifiers).size !== identifiers.length) {
    throw new Error(
      'Permission object, rule, and path identifiers must be unique',
    );
  }

  const defaultRoles = (definition.defaults ?? []).map(
    (rule) => rule.roleUniversalIdentifier,
  );
  if (new Set(defaultRoles).size !== defaultRoles.length) {
    throw new Error('Each role can have only one default permission rule');
  }
  for (const rule of [
    ...(definition.defaults ?? []),
    ...definition.objects.flatMap((object) => object.rules),
  ]) {
    if (new Set(rule.actions).size !== rule.actions.length) {
      throw new Error('Permission actions must be unique');
    }
  }

  return definition;
};
