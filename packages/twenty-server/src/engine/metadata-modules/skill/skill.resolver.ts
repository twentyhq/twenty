import { UseGuards, UseInterceptors, UseFilters } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';

import { isNonEmptyString } from '@sniptt/guards';
import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';
import { CreateSkillInput } from 'src/engine/metadata-modules/skill/dtos/create-skill.input';
import { SkillDTO } from 'src/engine/metadata-modules/skill/dtos/skill.dto';
import { UpdateSkillInput } from 'src/engine/metadata-modules/skill/dtos/update-skill.input';
import { SkillGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/skill/interceptors/skill-graphql-api-exception.interceptor';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';

// Reads only need the AI flag so the chat composer can list skills; mutations need AI_SETTINGS
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  SkillGraphqlApiExceptionInterceptor,
)
@MetadataResolver(() => SkillDTO)
@UseFilters(ApplicationExceptionFilter, AuthGraphqlApiExceptionFilter)
export class SkillResolver {
  constructor(
    private readonly skillService: SkillService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @ResolveField(() => String)
  async label(
    @Parent() skill: SkillDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string> {
    return this.resolveTranslatableProperty({
      skill,
      property: 'label',
      context,
      workspaceId: workspace.id,
    });
  }

  @ResolveField(() => String, { nullable: true })
  async description(
    @Parent() skill: SkillDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string | undefined> {
    if (!isNonEmptyString(skill.description)) {
      return skill.description;
    }

    return this.resolveTranslatableProperty({
      skill,
      property: 'description',
      context,
      workspaceId: workspace.id,
    });
  }

  @Query(() => [SkillDTO])
  async skills(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<SkillDTO[]> {
    const skills = await this.skillService.findAll(workspace.id);

    return skills.filter((skill) =>
      canCallerReachApplication({
        callingApplication,
        applicationId: skill.applicationId,
      }),
    );
  }

  @Query(() => SkillDTO, { nullable: true })
  @UseGuards(ApplicationTargetGuard)
  async skill(
    @ApplicationTargetArg(
      'id',
      {
        kind: 'applicationOwnedEntity',
        metadataName: 'skill',
        requireApplicationRegistrationOwnership: false,
      },
      { type: () => UUIDScalarType },
    )
    id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO | null> {
    return this.skillService.findById(id, workspace.id);
  }

  @Mutation(() => SkillDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async createSkill(
    @Args('input') input: CreateSkillInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO> {
    return this.skillService.create(input, workspace.id);
  }

  @Mutation(() => SkillDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async updateSkill(
    @Args('input') input: UpdateSkillInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO> {
    return this.skillService.update(input, workspace.id);
  }

  @Mutation(() => SkillDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async deleteSkill(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO> {
    return this.skillService.delete(id, workspace.id);
  }

  @Mutation(() => SkillDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async activateSkill(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO> {
    return this.skillService.activate(id, workspace.id);
  }

  @Mutation(() => SkillDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI_SETTINGS))
  async deactivateSkill(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SkillDTO> {
    return this.skillService.deactivate(id, workspace.id);
  }

  private async resolveTranslatableProperty({
    skill,
    property,
    context,
    workspaceId,
  }: {
    skill: SkillDTO;
    property: 'label' | 'description';
    context: { loaders: IDataloaders } & I18nContext;
    workspaceId: string;
  }): Promise<string> {
    return resolveEffectiveEntityProperty({
      metadataName: 'skill',
      baseValue: skill[property],
      overrides: undefined,
      property,
      i18nContext:
        await this.applicationTranslationCatalogService.buildEffectiveEntityI18nContext(
          {
            applicationId: skill.applicationId,
            loaders: context.loaders,
            locale: context.req.locale,
            workspaceId,
          },
        ),
    });
  }
}
