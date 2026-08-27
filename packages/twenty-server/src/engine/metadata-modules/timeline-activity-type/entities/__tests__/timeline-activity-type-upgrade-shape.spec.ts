import {
  ADD_TIMELINE_ACTIVITY_TYPE_REPLACEMENT_UPGRADE_COMMAND_NAME,
  ADD_TIMELINE_ACTIVITY_ROUTING_UPGRADE_COMMAND_NAME,
  REFACTOR_TIMELINE_ACTIVITY_TYPE_RENDERING_UPGRADE_COMMAND_NAME,
  TIMELINE_ACTIVITY_TYPE_OVERRIDABLE_ENTITY_UPGRADE_COMMAND_NAME,
} from 'src/database/commands/upgrade-version-command/2-34/timeline-activity-type-upgrade-command-name.constants';
import { DROP_TIMELINE_ACTIVITY_TYPE_RENDERER_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-35/drop-timeline-activity-type-renderer-upgrade-command-name.constant';
import { resolveEntityShapeAtUpgradeCursor } from 'src/engine/core-modules/upgrade/utils/resolve-entity-shape-at-upgrade-cursor.util';
import { TimelineActivityTypeEntity } from 'src/engine/metadata-modules/timeline-activity-type/entities/timeline-activity-type.entity';

const CURRENT_COLUMNS = [
  'renderer',
  'frontComponentUniversalIdentifier',
  'targetRelationFieldUniversalIdentifier',
  'triggerFieldUniversalIdentifiers',
  'replacesTimelineActivityTypeUniversalIdentifier',
  'overrides',
  'isActive',
].map((propertyName) => ({ propertyName, databaseName: propertyName }));

const resolveAt = (appliedSteps: string[]) =>
  resolveEntityShapeAtUpgradeCursor({
    entityClass: TimelineActivityTypeEntity,
    currentTableName: 'timelineActivityType',
    currentColumns: CURRENT_COLUMNS,
    isStepApplied: (stepName) => appliedSteps.includes(stepName),
  });

describe('TimelineActivityTypeEntity upgrade shape', () => {
  it('hides every 2.34 column while 2.33 workspace commands run', () => {
    expect(resolveAt([]).hiddenPropertyNames).toEqual(
      new Set(
        CURRENT_COLUMNS.map(({ propertyName }) => propertyName).filter(
          (propertyName) => propertyName !== 'renderer',
        ),
      ),
    );
  });

  it('reveals each column only after its instance command', () => {
    expect(
      resolveAt([
        REFACTOR_TIMELINE_ACTIVITY_TYPE_RENDERING_UPGRADE_COMMAND_NAME,
      ]).hiddenPropertyNames,
    ).toEqual(
      new Set([
        'targetRelationFieldUniversalIdentifier',
        'triggerFieldUniversalIdentifiers',
        'replacesTimelineActivityTypeUniversalIdentifier',
        'overrides',
        'isActive',
      ]),
    );

    expect(
      resolveAt([
        REFACTOR_TIMELINE_ACTIVITY_TYPE_RENDERING_UPGRADE_COMMAND_NAME,
        ADD_TIMELINE_ACTIVITY_ROUTING_UPGRADE_COMMAND_NAME,
      ]).hiddenPropertyNames,
    ).toEqual(
      new Set([
        'replacesTimelineActivityTypeUniversalIdentifier',
        'overrides',
        'isActive',
      ]),
    );

    expect(
      resolveAt([
        REFACTOR_TIMELINE_ACTIVITY_TYPE_RENDERING_UPGRADE_COMMAND_NAME,
        ADD_TIMELINE_ACTIVITY_ROUTING_UPGRADE_COMMAND_NAME,
        ADD_TIMELINE_ACTIVITY_TYPE_REPLACEMENT_UPGRADE_COMMAND_NAME,
      ]).hiddenPropertyNames,
    ).toEqual(new Set(['overrides', 'isActive']));

    expect(
      resolveAt([
        REFACTOR_TIMELINE_ACTIVITY_TYPE_RENDERING_UPGRADE_COMMAND_NAME,
        ADD_TIMELINE_ACTIVITY_ROUTING_UPGRADE_COMMAND_NAME,
        ADD_TIMELINE_ACTIVITY_TYPE_REPLACEMENT_UPGRADE_COMMAND_NAME,
        TIMELINE_ACTIVITY_TYPE_OVERRIDABLE_ENTITY_UPGRADE_COMMAND_NAME,
      ]).hiddenPropertyNames,
    ).toEqual(new Set());

    expect(
      resolveAt([
        REFACTOR_TIMELINE_ACTIVITY_TYPE_RENDERING_UPGRADE_COMMAND_NAME,
        ADD_TIMELINE_ACTIVITY_ROUTING_UPGRADE_COMMAND_NAME,
        ADD_TIMELINE_ACTIVITY_TYPE_REPLACEMENT_UPGRADE_COMMAND_NAME,
        TIMELINE_ACTIVITY_TYPE_OVERRIDABLE_ENTITY_UPGRADE_COMMAND_NAME,
        DROP_TIMELINE_ACTIVITY_TYPE_RENDERER_UPGRADE_COMMAND_NAME,
      ]).hiddenPropertyNames,
    ).toEqual(new Set(['renderer']));
  });
});
