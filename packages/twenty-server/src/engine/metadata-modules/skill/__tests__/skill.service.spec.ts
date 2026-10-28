import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

const WORKSPACE_ID = 'workspace-id';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000002';

const buildFlatSkill = ({
  id,
  label,
  overrides = null,
}: {
  id: string;
  label: string;
  overrides?: Record<string, unknown> | null;
}) => ({
  id,
  universalIdentifier: id,
  name: id,
  label,
  icon: null,
  description: null,
  content: 'Instructions',
  isCustom: false,
  isSystem: false,
  isActive: true,
  workspaceId: WORKSPACE_ID,
  applicationId: 'application-id',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  overrides,
});

describe('SkillService', () => {
  it('lists skills by their effective label', async () => {
    const flatSkillMaps = [
      buildFlatSkill({
        id: 'zeta',
        label: 'Zeta',
        overrides: {
          [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            label: 'Alpha',
          },
        },
      }),
      buildFlatSkill({ id: 'beta', label: 'Beta' }),
    ].reduce(
      (flatEntityMaps, flatSkill) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: flatSkill as never,
          flatEntityMaps,
        }),
      createEmptyFlatEntityMaps(),
    );
    const service = new SkillService(
      {} as never,
      {
        getOrRecomputeManyOrAllFlatEntityMaps: jest
          .fn()
          .mockResolvedValue({ flatSkillMaps }),
      } as never,
      {} as never,
    );

    const skills = await service.findAll(WORKSPACE_ID);

    expect(skills.map(({ id, label }) => ({ id, label }))).toEqual([
      { id: 'zeta', label: 'Alpha' },
      { id: 'beta', label: 'Beta' },
    ]);
  });
});
