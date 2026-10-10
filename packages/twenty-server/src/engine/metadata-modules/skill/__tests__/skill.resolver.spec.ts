import { msg } from '@lingui/core/macro';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { type SkillDTO } from 'src/engine/metadata-modules/skill/dtos/skill.dto';
import { SkillResolver } from 'src/engine/metadata-modules/skill/skill.resolver';

const WORKSPACE_ID = '33333333-3333-4333-8333-333333333333';
const STANDARD_APPLICATION_ID = '44444444-4444-4444-8444-444444444444';
const CUSTOM_APPLICATION_ID = '55555555-5555-4555-8555-555555555555';

// A real standard skill, so the messages below add nothing new to the extracted catalog
const SKILL_LABEL = 'Workflow Building';
const SKILL_DESCRIPTION =
  'Use when the user wants something to happen automatically: creating, changing, debugging or deleting a workflow, or phrasing a rule as when X happens do Y';

const FRENCH_MESSAGES: Record<string, string> = {
  [msg({ message: `Workflow Building`, context: 'skill.label' }).id]:
    'Création de workflows',
  [msg({
    message: `Use when the user wants something to happen automatically: creating, changing, debugging or deleting a workflow, or phrasing a rule as when X happens do Y`,
    context: 'skill.description',
  }).id]: 'Utiliser pour automatiser une action',
};

describe('SkillResolver translatable fields', () => {
  const workspace = { id: WORKSPACE_ID } as WorkspaceEntity;
  const loaders = {} as IDataloaders;
  const context: { loaders: IDataloaders } & I18nContext = {
    loaders,
    req: { locale: 'fr-FR' },
  };

  const aSkill = (overrides: Partial<SkillDTO> = {}): SkillDTO => ({
    id: 'skill-id',
    name: 'research',
    label: SKILL_LABEL,
    description: SKILL_DESCRIPTION,
    content: 'Skill content',
    isCustom: false,
    isSystem: false,
    isActive: true,
    workspaceId: WORKSPACE_ID,
    applicationId: STANDARD_APPLICATION_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const buildResolver = () => {
    const applicationTranslationCatalogService = {
      buildEffectiveEntityI18nContext: jest.fn(
        async ({
          applicationId,
          locale,
        }: {
          applicationId: string | undefined;
          locale: keyof typeof APP_LOCALES | undefined;
        }): Promise<EffectiveEntityI18nContext> => ({
          locale,
          i18nInstance: {
            _: (messageId: string) => FRENCH_MESSAGES[messageId] ?? messageId,
          },
          isStandardApp: applicationId === STANDARD_APPLICATION_ID,
          applicationCatalog: undefined,
          workspaceCustomApplicationUniversalIdentifier:
            'workspace-custom-application-universal-identifier',
          ownerApplicationUniversalIdentifier: undefined,
        }),
      ),
    };

    const resolver = new SkillResolver(
      {} as never,
      applicationTranslationCatalogService as never,
    );

    return { resolver, applicationTranslationCatalogService };
  };

  it('translates the label and description of a standard skill for the request locale', async () => {
    const { resolver, applicationTranslationCatalogService } = buildResolver();
    const skill = aSkill();

    const label = await resolver.label(skill, context, workspace);
    const description = await resolver.description(skill, context, workspace);

    expect(label).toBe('Création de workflows');
    expect(description).toBe('Utiliser pour automatiser une action');
    expect(
      applicationTranslationCatalogService.buildEffectiveEntityI18nContext,
    ).toHaveBeenCalledWith({
      applicationId: STANDARD_APPLICATION_ID,
      loaders,
      locale: 'fr-FR',
      workspaceId: WORKSPACE_ID,
    });
  });

  it('leaves a custom skill that no catalog knows unchanged', async () => {
    const { resolver } = buildResolver();
    const skill = aSkill({
      applicationId: CUSTOM_APPLICATION_ID,
      isCustom: true,
      label: 'Lead triage',
      description: 'Routes inbound leads to the right owner',
    });

    const label = await resolver.label(skill, context, workspace);
    const description = await resolver.description(skill, context, workspace);

    expect(label).toBe('Lead triage');
    expect(description).toBe('Routes inbound leads to the right owner');
  });

  it('returns a missing description without resolving a translation', async () => {
    const { resolver, applicationTranslationCatalogService } = buildResolver();

    const description = await resolver.description(
      aSkill({ description: undefined }),
      context,
      workspace,
    );

    expect(description).toBeUndefined();
    expect(
      applicationTranslationCatalogService.buildEffectiveEntityI18nContext,
    ).not.toHaveBeenCalled();
  });
});
