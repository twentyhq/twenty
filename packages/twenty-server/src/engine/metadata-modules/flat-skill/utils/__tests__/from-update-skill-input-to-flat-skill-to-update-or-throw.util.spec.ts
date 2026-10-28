import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { fromFlatSkillToSkillDto } from 'src/engine/metadata-modules/flat-skill/utils/from-flat-skill-to-skill-dto.util';
import { fromUpdateSkillInputToFlatSkillToUpdateOrThrow } from 'src/engine/metadata-modules/flat-skill/utils/from-update-skill-input-to-flat-skill-to-update-or-throw.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000001';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000002';

const appSkill: FlatSkill = {
  id: '00000000-0000-4000-8000-000000000003',
  universalIdentifier: '00000000-0000-4000-8000-000000000004',
  workspaceId: '00000000-0000-4000-8000-000000000005',
  applicationId: '00000000-0000-4000-8000-000000000006',
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  name: 'summarize',
  label: 'Summarize',
  icon: 'IconBook',
  description: null,
  content: 'Summarize the record',
  isSystem: false,
  isActive: true,
  overrides: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
};

const workspaceSkill: FlatSkill = {
  ...appSkill,
  id: '00000000-0000-4000-8000-000000000007',
  universalIdentifier: '00000000-0000-4000-8000-000000000008',
  applicationUniversalIdentifier:
    WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  name: 'translate',
  label: 'Translate',
};

const flatSkillMaps = [appSkill, workspaceSkill].reduce<
  FlatEntityMaps<FlatSkill>
>(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps(),
);

const updateAsWorkspace = (
  updateSkillInput: Parameters<
    typeof fromUpdateSkillInputToFlatSkillToUpdateOrThrow
  >[0]['updateSkillInput'],
) =>
  fromUpdateSkillInputToFlatSkillToUpdateOrThrow({
    flatSkillMaps,
    updateSkillInput,
    callerApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

describe('fromUpdateSkillInputToFlatSkillToUpdateOrThrow', () => {
  it('stores edits on another application skill as workspace overrides', () => {
    const result = updateAsWorkspace({
      id: appSkill.id,
      name: appSkill.name,
      label: 'Summarize briefly',
      content: 'Summarize the record in one line',
      isActive: false,
    });

    expect(result).toMatchObject({
      name: 'summarize',
      label: 'Summarize',
      content: 'Summarize the record',
      isActive: true,
      overrides: {
        [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
          label: 'Summarize briefly',
          content: 'Summarize the record in one line',
          isActive: false,
        },
      },
    });
    expect(fromFlatSkillToSkillDto(result)).toMatchObject({
      label: 'Summarize briefly',
      content: 'Summarize the record in one line',
      isActive: false,
    });
  });

  it('ignores a null isActive instead of storing it', () => {
    const result = updateAsWorkspace({
      id: appSkill.id,
      label: 'Summarize briefly',
      isActive: null as unknown as boolean,
    });

    expect(result.isActive).toBe(true);
    expect(
      result.overrides?.[WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER],
    ).toEqual({ label: 'Summarize briefly' });
    expect(fromFlatSkillToSkillDto(result).isActive).toBe(true);
  });

  it('refuses to rename another application skill', () => {
    expect(() =>
      updateAsWorkspace({ id: appSkill.id, name: 'renamed' }),
    ).toThrow('Cannot rename a skill owned by another application');
  });

  it('writes edits on a workspace skill to the skill itself', () => {
    expect(
      updateAsWorkspace({
        id: workspaceSkill.id,
        name: 'translate-to-french',
        content: 'Translate to French',
        isActive: false,
      }),
    ).toMatchObject({
      name: 'translate-to-french',
      content: 'Translate to French',
      isActive: false,
      overrides: null,
    });
  });
});
