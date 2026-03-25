import { type EachTestingContext } from 'twenty-shared/testing';

import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import {
  type CircularDependencyValidationResult,
  validateFlatEntityCircularDependency,
} from 'src/engine/workspace-manager/workspace-migration/utils/validate-flat-entity-circular-dependency.util';

type TestFlatEntity = UniversalSyncableFlatEntity & {
  parentUniversalIdentifier: string | null;
};

const createUniversalFlatEntityMaps = (
  entities: TestFlatEntity[],
): UniversalFlatEntityMaps<TestFlatEntity> => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
});

const createTestEntity = (
  universalIdentifier: string,
  parentUniversalIdentifier: string | null = null,
): TestFlatEntity => ({
  parentUniversalIdentifier,
  universalIdentifier,
  applicationUniversalIdentifier: 'test-app',
});

type TestContext = {
  flatEntityUniversalIdentifier: string;
  flatEntityParentUniversalIdentifier: string;
  maxDepth?: number;
  entities: TestFlatEntity[];
  expected: CircularDependencyValidationResult;
};

type ValidateCircularDependencyTestCase = EachTestingContext<TestContext>;

const testCases: ValidateCircularDependencyTestCase[] = [
  {
    title: 'should fail with self_reference when entity is its own parent',
    context: {
      flatEntityUniversalIdentifier: 'entity-1',
      flatEntityParentUniversalIdentifier: 'entity-1',
      entities: [],
      expected: {
        status: 'fail',
        reason: 'self_reference',
      },
    },
  },
  {
    title: 'should succeed with depth 2 when parent has no parent',
    context: {
      flatEntityUniversalIdentifier: 'entity-child',
      flatEntityParentUniversalIdentifier: 'entity-parent',
      entities: [createTestEntity('entity-parent', null)],
      expected: {
        status: 'success',
        depth: 2,
      },
    },
  },
  {
    title: 'should succeed with depth 3 when parent has a grandparent',
    context: {
      flatEntityUniversalIdentifier: 'entity-child',
      flatEntityParentUniversalIdentifier: 'entity-parent',
      entities: [
        createTestEntity('entity-grandparent', null),
        createTestEntity('entity-parent', 'entity-grandparent'),
      ],
      expected: {
        status: 'success',
        depth: 3,
      },
    },
  },
  {
    title:
      'should fail with circular_dependency when parent points back to entity',
    context: {
      flatEntityUniversalIdentifier: 'entity-a',
      flatEntityParentUniversalIdentifier: 'entity-b',
      entities: [createTestEntity('entity-b', 'entity-a')],
      expected: {
        status: 'fail',
        reason: 'circular_dependency',
        depth: 2,
      },
    },
  },
  {
    title:
      'should fail with circular_dependency when chain creates a cycle (A -> B -> C -> A)',
    context: {
      flatEntityUniversalIdentifier: 'entity-a',
      flatEntityParentUniversalIdentifier: 'entity-b',
      entities: [
        createTestEntity('entity-b', 'entity-c'),
        createTestEntity('entity-c', 'entity-a'),
      ],
      expected: {
        status: 'fail',
        reason: 'circular_dependency',
        depth: 3,
      },
    },
  },
  {
    title:
      'should fail with circular_dependency when ancestors form a cycle among themselves',
    context: {
      flatEntityUniversalIdentifier: 'entity-new',
      flatEntityParentUniversalIdentifier: 'entity-a',
      entities: [
        createTestEntity('entity-a', 'entity-b'),
        createTestEntity('entity-b', 'entity-a'),
      ],
      expected: {
        status: 'fail',
        reason: 'circular_dependency',
        depth: 3,
      },
    },
  },
  {
    title: 'should succeed when parent does not exist in maps',
    context: {
      flatEntityUniversalIdentifier: 'entity-child',
      flatEntityParentUniversalIdentifier: 'non-existent-parent',
      entities: [],
      expected: {
        status: 'success',
        depth: 1,
      },
    },
  },
  {
    title: 'should fail with max_depth_exceeded when depth exceeds maxDepth',
    context: {
      flatEntityUniversalIdentifier: 'entity-child',
      flatEntityParentUniversalIdentifier: 'entity-parent',
      maxDepth: 2,
      entities: [
        createTestEntity('entity-grandparent', null),
        createTestEntity('entity-parent', 'entity-grandparent'),
      ],
      expected: {
        status: 'fail',
        reason: 'max_depth_exceeded',
        depth: 3,
      },
    },
  },
  {
    title: 'should succeed when depth equals maxDepth',
    context: {
      flatEntityUniversalIdentifier: 'entity-child',
      flatEntityParentUniversalIdentifier: 'entity-parent',
      maxDepth: 3,
      entities: [
        createTestEntity('entity-grandparent', null),
        createTestEntity('entity-parent', 'entity-grandparent'),
      ],
      expected: {
        status: 'success',
        depth: 3,
      },
    },
  },
  {
    title: 'should succeed with depth 2 when maxDepth is 2 and parent is root',
    context: {
      flatEntityUniversalIdentifier: 'entity-child',
      flatEntityParentUniversalIdentifier: 'entity-parent',
      maxDepth: 2,
      entities: [createTestEntity('entity-parent', null)],
      expected: {
        status: 'success',
        depth: 2,
      },
    },
  },
  {
    title:
      'should check max depth before circular dependency to prevent infinite loop',
    context: {
      flatEntityUniversalIdentifier: 'entity-new',
      flatEntityParentUniversalIdentifier: 'entity-a',
      maxDepth: 2,
      entities: [
        createTestEntity('entity-a', 'entity-b'),
        createTestEntity('entity-b', 'entity-c'),
        createTestEntity('entity-c', 'entity-d'),
        createTestEntity('entity-d', 'entity-a'),
      ],
      expected: {
        status: 'fail',
        reason: 'max_depth_exceeded',
        depth: 3,
      },
    },
  },
  {
    title: 'should handle deep valid hierarchy without maxDepth',
    context: {
      flatEntityUniversalIdentifier: 'entity-new',
      flatEntityParentUniversalIdentifier: 'entity-1',
      entities: [
        createTestEntity('entity-5', null),
        createTestEntity('entity-4', 'entity-5'),
        createTestEntity('entity-3', 'entity-4'),
        createTestEntity('entity-2', 'entity-3'),
        createTestEntity('entity-1', 'entity-2'),
      ],
      expected: {
        status: 'success',
        depth: 6,
      },
    },
  },
];

describe('validateFlatEntityCircularDependency', () => {
  test.each(testCases)('$title', ({ context }) => {
    const flatEntityMaps = createUniversalFlatEntityMaps(context.entities);

    const result = validateFlatEntityCircularDependency({
      flatEntityUniversalIdentifier: context.flatEntityUniversalIdentifier,
      flatEntityParentUniversalIdentifier:
        context.flatEntityParentUniversalIdentifier,
      maxDepth: context.maxDepth,
      parentUniversalIdentifierKey: 'parentUniversalIdentifier',
      flatEntityMaps,
    });

    expect(result).toEqual(context.expected);
  });
});
