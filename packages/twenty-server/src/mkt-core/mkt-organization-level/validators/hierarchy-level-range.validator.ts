import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import {
  MAX_ORGANIZATION_HIERARCHY_DEPTH,
  HIERARCHY_VALIDATION_RULES,
} from 'src/mkt-core/mkt-organization-level/constants/hierarchy-constraints.constants';

@ValidatorConstraint({ name: 'isValidHierarchyLevel', async: false })
export class IsValidHierarchyLevelConstraint
  implements ValidatorConstraintInterface
{
  validate(hierarchyLevel: number, _args: ValidationArguments) {
    // Check range
    return (
      hierarchyLevel >= HIERARCHY_VALIDATION_RULES.MIN_HIERARCHY_LEVEL &&
      hierarchyLevel <= HIERARCHY_VALIDATION_RULES.MAX_HIERARCHY_LEVEL
    );
  }

  defaultMessage(_args: ValidationArguments) {
    return `Hierarchy level must be between ${HIERARCHY_VALIDATION_RULES.MIN_HIERARCHY_LEVEL} and ${HIERARCHY_VALIDATION_RULES.MAX_HIERARCHY_LEVEL}`;
  }
}

/**
 * Custom decorator to validate hierarchy level range
 */
export function IsValidHierarchyLevel(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidHierarchyLevelConstraint,
    });
  };
}

/**
 * Utility function to validate hierarchy level
 */
export function validateHierarchyLevelRange(hierarchyLevel: number): boolean {
  return (
    hierarchyLevel >= 1 && hierarchyLevel <= MAX_ORGANIZATION_HIERARCHY_DEPTH
  );
}

/**
 * Get validation error message for invalid hierarchy level
 */
export function getHierarchyLevelValidationError(
  hierarchyLevel: number,
): string | null {
  if (hierarchyLevel < 1) {
    return 'Hierarchy level must be at least 1 (1 = highest level)';
  }

  if (hierarchyLevel > MAX_ORGANIZATION_HIERARCHY_DEPTH) {
    return `Hierarchy level cannot exceed ${MAX_ORGANIZATION_HIERARCHY_DEPTH} (maximum allowed depth)`;
  }

  if (!Number.isInteger(hierarchyLevel)) {
    return 'Hierarchy level must be a whole number';
  }

  return null; // Valid
}
