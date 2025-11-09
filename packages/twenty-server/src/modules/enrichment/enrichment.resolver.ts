import { Logger, UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';

import { EnrichCompanyInput } from './dtos/enrich-company-input.dto';
import { EnrichCompanyResult } from './dtos/enrich-company-result.dto';
import { LinkupEnrichmentService } from './services/linkup-enrichment.service';

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class EnrichmentResolver {
  private readonly logger = new Logger(EnrichmentResolver.name);

  constructor(
    private readonly linkupEnrichmentService: LinkupEnrichmentService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  @Query(() => Boolean)
  async isEnrichmentEnabled(
    @AuthWorkspace() _workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.linkupEnrichmentService.isEnabled();
  }

  @Mutation(() => EnrichCompanyResult)
  async enrichCompany(
    @Args('input') input: EnrichCompanyInput,
    @AuthWorkspace() _workspace: WorkspaceEntity,
  ): Promise<EnrichCompanyResult> {
    this.logger.log(
      `Enriching company: ${input.companyName} (ID: ${input.companyId})`,
    );

    const fieldsToEnrich = input.fieldsToEnrich || [
      'employees',
      'annualRecurringRevenue',
      'address',
      'linkedinLink',
      'xLink',
      'domainName',
    ];

    this.logger.log(`Fields requested: ${JSON.stringify(fieldsToEnrich)}`);

    const result = await this.linkupEnrichmentService.enrichCompany(
      input.companyName,
      fieldsToEnrich,
    );

    this.logger.log(`Enrichment result: ${JSON.stringify(result)}`);

    if (result.success && result.structuredData) {
      try {
        const companyRepository =
          await this.twentyORMManager.getRepository('company');

        const updateData: Record<string, unknown> = {
          idealCustomerProfile: true,
        };

        this.logger.log(`Fields to update: ${JSON.stringify(fieldsToEnrich)}`);
        this.logger.log(
          `Structured data: ${JSON.stringify(result.structuredData)}`,
        );

        if (
          fieldsToEnrich.includes('employees') &&
          result.structuredData.employees
        ) {
          const employeeCount = parseInt(result.structuredData.employees, 10);

          if (!isNaN(employeeCount)) {
            updateData.employees = employeeCount;
          }
        }

        if (
          fieldsToEnrich.includes('annualRecurringRevenue') &&
          result.structuredData.revenue
        ) {
          const revenueAmount = parseFloat(result.structuredData.revenue);

          if (!isNaN(revenueAmount)) {
            updateData.annualRecurringRevenue = {
              amountMicros: Math.round(revenueAmount * 1000000),
              currencyCode: 'USD',
            };
          }
        }

        if (
          fieldsToEnrich.includes('address') &&
          result.structuredData.address
        ) {
          updateData.address = {
            addressStreet1: result.structuredData.address,
            addressStreet2: null,
            addressCity: null,
            addressState: null,
            addressCountry: null,
            addressPostcode: null,
            addressLat: null,
            addressLng: null,
          };
        }

        if (
          fieldsToEnrich.includes('linkedinLink') &&
          result.structuredData.linkedinUrl
        ) {
          updateData.linkedinLink = {
            primaryLinkUrl: result.structuredData.linkedinUrl,
            primaryLinkLabel: 'LinkedIn',
            secondaryLinks: null,
          };
        }

        if (fieldsToEnrich.includes('xLink') && result.structuredData.xUrl) {
          updateData.xLink = {
            primaryLinkUrl: result.structuredData.xUrl,
            primaryLinkLabel: 'X',
            secondaryLinks: null,
          };
        }

        if (
          fieldsToEnrich.includes('domainName') &&
          result.structuredData.website
        ) {
          updateData.domainName = {
            primaryLinkUrl: result.structuredData.website,
            primaryLinkLabel: 'Website',
            secondaryLinks: null,
          };
        }

        this.logger.log(
          `Update data to be saved: ${JSON.stringify(updateData, null, 2)}`,
        );

        const updateResult = await companyRepository.update(
          input.companyId,
          updateData,
        );

        this.logger.log(`Update result: ${JSON.stringify(updateResult)}`);
      } catch (error) {
        this.logger.error('Failed to update company record:', error);
        this.logger.error('Error stack:', error.stack);
      }
    } else {
      this.logger.warn(
        `Enrichment not successful or no structured data. Success: ${result.success}, HasStructuredData: ${!!result.structuredData}`,
      );
    }

    return {
      success: result.success,
      description: result.description,
      sources: result.sources,
      error: result.error,
    };
  }
}
