import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { SELF_TIMELINE_ACTIVITY_RULE_ACTIONS } from 'src/engine/metadata-modules/timeline-activity-rule/constants/self-timeline-activity-rule-actions.constant';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';

// Every audit logged non system object records its own changes. Materialising
// this as a row per object would mean backfilling every object of every
// workspace, so it is derived and only overrides are persisted.
export const deriveDefaultTimelineActivityRule = (
  flatObjectMetadata: FlatObjectMetadata,
): TimelineActivityRule | undefined => {
  if (!flatObjectMetadata.isAuditLogged || flatObjectMetadata.isSystem) {
    return undefined;
  }

  return {
    sourceFlatObjectMetadata: flatObjectMetadata,
    relationFieldMetadataId: null,
    actions: [...SELF_TIMELINE_ACTIVITY_RULE_ACTIONS],
    triggerFieldNames: null,
    targetShape: { kind: 'SELF' },
  };
};
