import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, pickMorphGroupSurvivorOrThrow } from 'twenty-shared/utils';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

describe('Target junction config standard metadata build', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  const { byUniversalIdentifier } = allFlatEntityMaps.flatFieldMetadataMaps;

  const getJunctionTargetUniversalIdentifier = (
    fieldUniversalIdentifier: string,
  ): string | null | undefined => {
    const field = byUniversalIdentifier[fieldUniversalIdentifier];

    if (!isDefined(field) || !isDefined(field.universalSettings)) {
      return undefined;
    }

    return 'junctionTargetFieldUniversalIdentifier' in field.universalSettings
      ? field.universalSettings.junctionTargetFieldUniversalIdentifier
      : undefined;
  };

  const CLEAN_SIDE_CASES = [
    {
      source: STANDARD_OBJECTS.person.fields.noteTargets.universalIdentifier,
      target: STANDARD_OBJECTS.noteTarget.fields.note.universalIdentifier,
    },
    {
      source: STANDARD_OBJECTS.person.fields.taskTargets.universalIdentifier,
      target: STANDARD_OBJECTS.taskTarget.fields.task.universalIdentifier,
    },
    {
      source: STANDARD_OBJECTS.company.fields.noteTargets.universalIdentifier,
      target: STANDARD_OBJECTS.noteTarget.fields.note.universalIdentifier,
    },
    {
      source: STANDARD_OBJECTS.company.fields.taskTargets.universalIdentifier,
      target: STANDARD_OBJECTS.taskTarget.fields.task.universalIdentifier,
    },
    {
      source:
        STANDARD_OBJECTS.opportunity.fields.noteTargets.universalIdentifier,
      target: STANDARD_OBJECTS.noteTarget.fields.note.universalIdentifier,
    },
    {
      source:
        STANDARD_OBJECTS.opportunity.fields.taskTargets.universalIdentifier,
      target: STANDARD_OBJECTS.taskTarget.fields.task.universalIdentifier,
    },
    {
      source: STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
      target:
        STANDARD_OBJECTS.noteTarget.fields.targetPerson.universalIdentifier,
    },
    {
      source: STANDARD_OBJECTS.task.fields.taskTargets.universalIdentifier,
      target:
        STANDARD_OBJECTS.taskTarget.fields.targetCompany.universalIdentifier,
    },
  ];

  it.each(CLEAN_SIDE_CASES)(
    'arms the junction config on the relation field %#',
    ({ source, target }) => {
      expect(getJunctionTargetUniversalIdentifier(source)).toBe(target);
    },
  );

  const MORPH_SIDE_CASES = [
    {
      source: STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
      morphLegUniversalIdentifiers: [
        STANDARD_OBJECTS.noteTarget.fields.targetPerson.universalIdentifier,
        STANDARD_OBJECTS.noteTarget.fields.targetCompany.universalIdentifier,
        STANDARD_OBJECTS.noteTarget.fields.targetOpportunity
          .universalIdentifier,
      ],
    },
    {
      source: STANDARD_OBJECTS.task.fields.taskTargets.universalIdentifier,
      morphLegUniversalIdentifiers: [
        STANDARD_OBJECTS.taskTarget.fields.targetPerson.universalIdentifier,
        STANDARD_OBJECTS.taskTarget.fields.targetCompany.universalIdentifier,
        STANDARD_OBJECTS.taskTarget.fields.targetOpportunity
          .universalIdentifier,
      ],
    },
  ];

  it.each(MORPH_SIDE_CASES)(
    'points the morph junction at the morph group survivor %#',
    ({ source, morphLegUniversalIdentifiers }) => {
      const morphGroup = morphLegUniversalIdentifiers
        .map((uid) => byUniversalIdentifier[uid])
        .filter(isDefined);

      const survivor = pickMorphGroupSurvivorOrThrow(morphGroup);

      expect(getJunctionTargetUniversalIdentifier(source)).toBe(
        survivor.universalIdentifier,
      );
    },
  );
});
