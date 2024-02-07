import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';
import { Record } from 'src/workspace/workspace-query-builder/interfaces/record.interface';

import { capitalize } from 'src/utils/capitalize';
import { stringifyWithoutKeyQuote } from 'src/workspace/workspace-query-builder/utils/stringify-without-key-quote.util';
import { WorkspaceQueryRunnerService } from 'src/workspace/workspace-query-runner/workspace-query-runner.service';
@Injectable()
export class CreateCompaniesService {
  constructor(
    private readonly workspaceQueryRunnunerService: WorkspaceQueryRunnerService,
  ) {}

  async createCompanyFromDomainName(
    domainName: string,
    workspaceId: string,
    objectMetadataItemCollection: ObjectMetadataInterface[],
  ) {
    const companyName = capitalize(domainName.split('.')[0]);

    const companyObjectMetadata = objectMetadataItemCollection.find(
      (item) => item.nameSingular === 'company',
    );

    if (!companyObjectMetadata) {
      return;
    }

    let relatedCompanyId = v4();

    const existingCompany =
      await this.workspaceQueryRunnunerService.executeAndParse<Record>(
        `query {companyCollection(filter: {domainName: {eq: "${domainName}"}}) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          `,
        companyObjectMetadata,
        '',
        workspaceId,
      );

    if (existingCompany.edges?.length) {
      relatedCompanyId = existingCompany.edges[0].node.id;
    }

    await this.workspaceQueryRunnunerService.execute(
      `mutation {
          insertIntocompanyCollection(objects: ${stringifyWithoutKeyQuote([
            {
              id: relatedCompanyId,
              name: companyName,
              domainName: domainName,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ])}) {
            affectedCount
            records {
              id
            }
          }
        }
      `,
      workspaceId,
    );
  }
}
