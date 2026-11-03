import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { MoreThan } from 'typeorm';

import { FilterArgProcessorService } from 'src/engine/api/common/common-args-processors/filter-arg-processor/filter-arg-processor.service';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { ADD_PEOPLE_TO_MESSAGE_LIST_MAX_PERSON_COUNT } from 'src/modules/emailing/constants/add-people-to-message-list-max-person-count.constant';
import { ADD_PEOPLE_TO_MESSAGE_LIST_PAGE_SIZE } from 'src/modules/emailing/constants/add-people-to-message-list-page-size.constant';
import {
  MessageListException,
  MessageListExceptionCode,
} from 'src/modules/emailing/exceptions/message-list.exception';
import { type MessageListMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';
import { type AddPeopleToMessageListJobData } from 'src/modules/emailing/types/add-people-to-message-list-job-data.type';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class AddPeopleToMessageListService {
  constructor(
    private readonly filterArgProcessorService: FilterArgProcessorService,
    private readonly userWorkspaceAuthContextService: UserWorkspaceAuthContextService,
    private readonly actorFromAuthContextService: ActorFromAuthContextService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async assertPersonCountWithinLimit({
    authContext,
    personFilter,
  }: {
    authContext: WorkspaceAuthContext;
    personFilter: Partial<ObjectRecordFilter>;
  }): Promise<void> {
    const totalCount = await this.workspaceOrmManager.executeInWorkspaceContext(
      () => this.buildPersonQueryBuilder(personFilter).getCount(),
      authContext,
    );

    if (totalCount > ADD_PEOPLE_TO_MESSAGE_LIST_MAX_PERSON_COUNT) {
      throw new MessageListException(
        `Cannot add ${totalCount} people to a list at once`,
        MessageListExceptionCode.MESSAGE_LIST_TOO_MANY_PEOPLE_TO_ADD,
      );
    }
  }

  async addPeopleToMessageList({
    workspaceId,
    userWorkspaceId,
    applicationId,
    messageListId,
    personFilter,
  }: AddPeopleToMessageListJobData): Promise<void> {
    const authContext = await this.userWorkspaceAuthContextService.resolve({
      workspaceId,
      userWorkspaceId,
      applicationId,
    });

    await this.assertPersonCountWithinLimit({ authContext, personFilter });

    const maxPageCount = Math.ceil(
      ADD_PEOPLE_TO_MESSAGE_LIST_MAX_PERSON_COUNT /
        ADD_PEOPLE_TO_MESSAGE_LIST_PAGE_SIZE,
    );
    let after: string | undefined;

    for (let pageIndex = 0; pageIndex < maxPageCount; pageIndex++) {
      const fetchedRecords =
        await this.workspaceOrmManager.executeInWorkspaceContext(() => {
          const queryBuilder = this.buildPersonQueryBuilder(personFilter)
            .select(['id'])
            .orderBy('id')
            .limit(ADD_PEOPLE_TO_MESSAGE_LIST_PAGE_SIZE + 1);

          if (isDefined(after)) {
            queryBuilder.andWhere({ id: MoreThan(after) });
          }

          return queryBuilder.getMany<Pick<PersonWorkspaceEntity, 'id'>>();
        }, authContext);
      const records = fetchedRecords.slice(
        0,
        ADD_PEOPLE_TO_MESSAGE_LIST_PAGE_SIZE,
      );

      if (records.length > 0) {
        const members =
          await this.actorFromAuthContextService.injectActorFieldsOnCreate({
            records: records.map((person) => ({
              listId: messageListId,
              personId: person.id,
            })),
            objectMetadataNameSingular: 'messageListMember',
            authContext,
          });

        await this.workspaceOrmManager.executeInWorkspaceContext(
          () =>
            this.workspaceOrmManager
              .getRepository<MessageListMemberWorkspaceEntity>(
                'messageListMember',
              )
              .insert(members, { onConflictDoNothing: true }),
          authContext,
        );
      }

      if (fetchedRecords.length <= ADD_PEOPLE_TO_MESSAGE_LIST_PAGE_SIZE) {
        return;
      }

      after = records[records.length - 1].id;
    }

    throw new MessageListException(
      `More than ${ADD_PEOPLE_TO_MESSAGE_LIST_MAX_PERSON_COUNT} people match the selection`,
      MessageListExceptionCode.MESSAGE_LIST_TOO_MANY_PEOPLE_TO_ADD,
    );
  }

  private buildPersonQueryBuilder(
    personFilter: Partial<ObjectRecordFilter>,
  ): WorkspaceSelectQueryBuilder {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    } = getWorkspaceContext();
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: objectIdByNameSingular.person,
    });
    const filter = this.filterArgProcessorService.process({
      filter: personFilter,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
    const queryParser = new GraphqlQueryParser(
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    );
    const queryBuilder = this.workspaceOrmManager
      .getRepository<PersonWorkspaceEntity>('person')
      .createQueryBuilder('person');

    queryParser.applyFilterToBuilder(queryBuilder, 'person', filter);
    queryParser.applyDeletedAtToBuilder(queryBuilder, filter);

    return queryBuilder;
  }
}
