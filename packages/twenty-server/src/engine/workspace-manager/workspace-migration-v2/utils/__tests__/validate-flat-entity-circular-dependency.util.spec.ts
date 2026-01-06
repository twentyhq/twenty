import { type EachTestingContext } from 'twenty-shared/testing';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import {
  type CircularDependencyValidationResult,
  validateFlatEntityCircularDependency,
} from 'src/engine/workspace-manager/workspace-migration-v2/utils/validate-flat-entity-circular-dependency.util';

type TestFlatEntity = SyncableFlatEntity & {
  parentId: string | null;
};

const createFlatEntityMaps = (
  entities: TestFlatEntity[],
): FlatEntityMaps<TestFlatEntity> => ({
  byId: Object.fromEntries(entities.map((entity) => [entity.id, entity])),
  idByUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity.id]),
  ),
  universalIdentifiersByApplicationId: {},
});

const createTestEntity = (
  id: string,
  parentId: string | null = null,
): TestFlatEntity => ({
  id,
  parentId,
  universalIdentifier: id,
  applicationId: 'test-app',
  workspaceId: 'test-workspace',
});

type TestContext = {
  flatEntityId: string;
  flatEntityParentId: string;
  maxDepth?: number;
  entities: TestFlatEntity[];
  expected: CircularDependencyValidationResult;
};

type ValidateCircularDependencyTestCase = EachTestingContext<TestContext>;

const testCases: ValidateCircularDependencyTestCase[] = [
  {
    title: 'should fail with self_reference when entity is its own parent',
    context: {
      flatEntityId: 'entity-1',
      flatEntityParentId: 'entity-1',
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
      flatEntityId: 'entity-child',
      flatEntityParentId: 'entity-parent',
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
      flatEntityId: 'entity-child',
      flatEntityParentId: 'entity-parent',
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
      flatEntityId: 'entity-a',
      flatEntityParentId: 'entity-b',
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
      flatEntityId: 'entity-a',
      flatEntityParentId: 'entity-b',
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
      flatEntityId: 'entity-new',
      flatEntityParentId: 'entity-a',
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
      flatEntityId: 'entity-child',
      flatEntityParentId: 'non-existent-parent',
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
      flatEntityId: 'entity-child',
      flatEntityParentId: 'entity-parent',
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
      flatEntityId: 'entity-child',
      flatEntityParentId: 'entity-parent',
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
      flatEntityId: 'entity-child',
      flatEntityParentId: 'entity-parent',
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
      flatEntityId: 'entity-new',
      flatEntityParentId: 'entity-a',
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
      flatEntityId: 'entity-new',
      flatEntityParentId: 'entity-1',
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
    const flatEntityMaps = createFlatEntityMaps(context.entities);

    const result = validateFlatEntityCircularDependency({
      flatEntityId: context.flatEntityId,
      flatEntityParentId: context.flatEntityParentId,
      maxDepth: context.maxDepth,
      parentIdKey: 'parentId',
      flatEntityMaps,
    });

    expect(result).toEqual(context.expected);
  });
});
