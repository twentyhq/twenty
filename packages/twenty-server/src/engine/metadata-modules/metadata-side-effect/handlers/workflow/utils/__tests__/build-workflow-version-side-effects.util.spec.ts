import { buildWorkflowVersionSideEffects } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow/utils/build-workflow-version-side-effects.util';
import { validateApplicationWorkflowVersion } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-application-workflow-version.util';
import { type WorkflowManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromWorkflowManifestToUniversalFlatWorkflowOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-manifest-to-universal-flat-workflow-or-throw.util';
import { buildAllFlatEntityOperationRecordByMetadataNameFromFromTo } from 'src/engine/core-modules/application/application-manifest/utils/build-all-flat-entity-operation-record-by-metadata-name-from-from-to.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { flatEntityToScalarFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/flat-entity-to-scalar-flat-entity.util';

const APPLICATION_ID = '11111111-1111-4111-8111-111111111111';
const WORKFLOW_ID = '22222222-2222-4222-8222-222222222222';
const VERSION_ID = '33333333-3333-4333-8333-333333333333';
const TRIGGER_ID = '44444444-4444-4444-8444-444444444444';
const STEP_ID = '55555555-5555-4555-8555-555555555555';
const buildOptions = {
  isSystemBuild: false,
  applicationUniversalIdentifier: APPLICATION_ID,
  inferDeletionFromMissingEntities: true as const,
};
const manifest: WorkflowManifest = {
  universalIdentifier: WORKFLOW_ID,
  name: 'Application workflow',
  version: {
    universalIdentifier: VERSION_ID,
    trigger: {
      universalIdentifier: TRIGGER_ID,
      type: 'MANUAL',
      nextStepIds: [STEP_ID],
    },
    steps: [
      {
        universalIdentifier: STEP_ID,
        name: 'Finish',
        type: 'EMPTY',
        input: {},
        nextStepIds: [],
      },
    ],
  },
};

const convert = (
  definition = manifest,
  existing = createEmptyAllFlatEntityMaps(),
  now = '2026-09-29T10:00:00.000Z',
) => {
  const workflow = fromWorkflowManifestToUniversalFlatWorkflowOrThrow({
    manifest: definition,
    applicationUniversalIdentifier: APPLICATION_ID,
    now,
    logicFunctionIdByUniversalIdentifier: new Map(),
    existingWorkflow:
      existing.flatWorkflowMaps.byUniversalIdentifier[WORKFLOW_ID],
    existingVersion:
      existing.flatWorkflowVersionMaps.byUniversalIdentifier[VERSION_ID],
  });
  const version = workflow.flatUniversalWorkflowVersion;
  if (!isDefined(version)) {
    throw new Error('Expected managed version');
  }
  return { workflow, version };
};

const persisted = ({ workflow, version }: ReturnType<typeof convert>) => {
  const maps = createEmptyAllFlatEntityMaps();
  const { flatUniversalWorkflowVersion: _payload, ...storedWorkflow } =
    workflow;
  maps.flatWorkflowMaps.byUniversalIdentifier[WORKFLOW_ID] = {
    ...storedWorkflow,
    workspaceId: APPLICATION_ID,
    applicationId: APPLICATION_ID,
  };
  maps.flatWorkflowVersionMaps.byUniversalIdentifier[VERSION_ID] = {
    ...version,
    workspaceId: APPLICATION_ID,
    applicationId: APPLICATION_ID,
  };
  return maps;
};

const expand = (
  workflow: ReturnType<typeof convert>['workflow'],
  from = createEmptyAllFlatEntityMaps(),
) => {
  const to = createEmptyAllFlatEntityMaps();
  to.flatWorkflowMaps.byUniversalIdentifier[WORKFLOW_ID] =
    workflow as FlatWorkflow;
  const operations = buildAllFlatEntityOperationRecordByMetadataNameFromFromTo({
    fromAllFlatEntityMaps: from,
    toAllUniversalFlatEntityMaps: to,
    buildOptions,
  });
  if (!isDefined(operations.workflow)) {
    return {};
  }
  const result = buildWorkflowVersionSideEffects({
    flatEntity: workflow,
    allFlatEntityOperationRecordByMetadataName: operations,
    relatedFlatEntityMaps: from,
    context: { buildOptions },
  });
  if (result.status !== 'success') {
    throw new Error(JSON.stringify(result));
  }
  return result.operations;
};

describe('application workflow version side effects', () => {
  it('creates a managed companion and excludes its payload from scalar storage', () => {
    const { workflow, version } = convert();
    const operations = expand(workflow);
    expect(
      operations.workflowVersion?.flatEntityToCreate?.[VERSION_ID],
    ).toEqual(version);
    expect(version.isSystemSideEffect).toBe(true);
    expect(
      flatEntityToScalarFlatEntity({
        metadataName: 'workflow',
        flatEntity: workflow as FlatWorkflow,
      }),
    ).not.toHaveProperty('flatUniversalWorkflowVersion');
  });

  it('updates the same version for a graph-only change without mutating the previous definition', () => {
    const before = convert();
    const changed = structuredClone(manifest);
    changed.version.steps[0].name = 'Updated step';
    const after = convert(changed, persisted(before));
    const operations = expand(after.workflow, persisted(before));
    expect(after.workflow.versionDefinitionHash).not.toBe(
      before.workflow.versionDefinitionHash,
    );
    expect(
      operations.workflowVersion?.flatEntityToUpdate?.[VERSION_ID],
    ).toMatchObject({
      id: before.version.id,
      steps: [{ name: 'Updated step' }],
    });
    expect(operations.workflowVersion?.flatEntityToDelete).toBeUndefined();
    expect(before.version.steps?.[0].name).toBe('Finish');
  });

  it('rejects two workflows that declare the same version identifier in one installation', () => {
    const first = convert().workflow;
    const second = convert({
      ...manifest,
      universalIdentifier: '66666666-6666-4666-8666-666666666666',
    }).workflow;
    const result = buildWorkflowVersionSideEffects({
      flatEntity: second,
      allFlatEntityOperationRecordByMetadataName: {
        workflow: {
          flatEntityToCreate: {
            [first.universalIdentifier]: first,
            [second.universalIdentifier]: second,
          },
          flatEntityToUpdate: {},
          flatEntityToDelete: {},
        },
      },
      relatedFlatEntityMaps: createEmptyAllFlatEntityMaps(),
      context: { buildOptions },
    });
    expect(result.status).toBe('fail');
    expect(JSON.stringify(result)).toContain(
      'cannot share a version identifier',
    );
  });

  it('does not generate operations when only sync timestamps change', () => {
    const before = convert();
    const after = convert(
      manifest,
      persisted(before),
      '2026-09-30T10:00:00.000Z',
    );
    expect(after.workflow.versionDefinitionHash).toBe(
      before.workflow.versionDefinitionHash,
    );
    expect(expand(after.workflow, persisted(before))).toEqual({});
  });

  it('adopts the existing POC companion in place without inferring its deletion', () => {
    const before = convert();
    const existing = persisted(before);
    existing.flatWorkflowMaps.byUniversalIdentifier[
      WORKFLOW_ID
    ]!.versionDefinitionHash = null;
    existing.flatWorkflowVersionMaps.byUniversalIdentifier[
      VERSION_ID
    ]!.isSystemSideEffect = false;
    const after = convert(manifest, existing);
    const operations = expand(after.workflow, existing);
    expect(
      operations.workflowVersion?.flatEntityToUpdate?.[VERSION_ID],
    ).toMatchObject({ id: before.version.id, isSystemSideEffect: true });
    expect(operations.workflowVersion?.flatEntityToDelete).toBeUndefined();
  });

  it('leaves API workflow operations without a version payload unchanged', () => {
    const { workflow } = convert();
    const { flatUniversalWorkflowVersion: _payload, ...apiWorkflow } = workflow;
    expect(
      buildWorkflowVersionSideEffects({
        flatEntity: apiWorkflow,
        allFlatEntityOperationRecordByMetadataName: {},
        relatedFlatEntityMaps: createEmptyAllFlatEntityMaps(),
        context: { buildOptions },
      }),
    ).toEqual({ status: 'noop' });
  });
});

const validate = (
  version: ReturnType<typeof convert>['version'],
  maps: AllFlatEntityMaps,
) => ({
  errors: validateApplicationWorkflowVersion({
    version,
    relatedFlatEntityMaps: maps,
  }),
});

describe('managed workflow version validation', () => {
  it('accepts a valid companion and accumulates missing edge and self-cycle errors', () => {
    const definition = convert();
    const maps = persisted(definition);
    maps.flatWorkflowVersionMaps =
      createEmptyAllFlatEntityMaps().flatWorkflowVersionMaps;
    expect(validate(definition.version, maps).errors).toEqual([]);
    const invalid = structuredClone(manifest);
    invalid.version.trigger.nextStepIds = [APPLICATION_ID];
    invalid.version.steps[0].nextStepIds = [STEP_ID];
    const { version } = convert(invalid);
    expect(validate(version, maps).errors.length).toBeGreaterThan(1);
  });

  it('validates a managed definition but leaves API definitions unchanged', () => {
    const definition = convert();
    const maps = persisted(definition);
    const invalid = { ...definition.version, triggers: null };
    expect(validate(invalid, maps).errors).not.toEqual([]);
    expect(
      validate({ ...invalid, isSystemSideEffect: false }, maps).errors,
    ).toEqual([]);
  });
});
