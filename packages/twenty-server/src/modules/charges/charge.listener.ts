/* eslint-disable no-case-declarations */
import { Injectable, Logger } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

import { InterApiService } from './inter/services/inter-api.service';
import {
  ChargeRecurrence,
  ChargeWorkspaceEntity,
} from './standard-objects/charge.workspace-entity';

@Injectable()
export class ChargeEventListener {
  private readonly logger = new Logger('ChargeEventListener');

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly interApiService: InterApiService,
  ) {}

  @OnDatabaseBatchEvent('charge', DatabaseEventAction.UPDATED)
  async handleChargeCreateEvent(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    // TODO: Move this to use the chargeQueue
    const { workspaceId, name: eventName, events } = payload;

    this.logger.log(`Charge update triggered.`);

    if (!workspaceId || !eventName) {
      this.logger.error(
        `Missing workspaceId or eventName in payload ${JSON.stringify(payload)}`,
      );

      return;
    }

    const chargeRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChargeWorkspaceEntity>(
        workspaceId,
        'charge',
      );

    const attachmentRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AttachmentWorkspaceEntity>(
        workspaceId,
        'attachment',
      );

    const charges = await Promise.all(
      events.map((event) =>
        chargeRepository.findOne({
          where: { id: event.recordId },
          relations: ['product', 'person', 'company'],
        }),
      ),
    );

    await Promise.all(
      charges.map(async (charge) => {
        if (!charge) {
          this.logger.warn(`Charge not found for recordId: ${charge}`);

          return;
        }

        const contact = charge.person as PersonWorkspaceEntity;
        const client = charge.company as CompanyWorkspaceEntity;

        const { chargeAction, id, price } = charge;
        const dataVencimento = '2025-10-21'; //temporario

        if (!contact || !client) {
          this.logger.warn(
            `Charge ${id} não possui relação com person ou company. Ignorando.`,
          );

          charge.chargeAction = 'none';

          return;
        }

        this.logger.log('person', client);

        const cliente = {
          nome: client.name || '',
          cpfCnpj: client.cpfCnpj || '',
          tipoPessoa:
            charge.entityType === 'individual' ? 'FISICA' : 'JURIDICA',
          endereco: client.address.addressStreet1 || 'Rua ...',
          telefone: contact.phone || '',
          cep: client.address.addressZipCode || '18103418',
          cidade: client.address.addressCity || '',
          uf: client.address.addressState || 'SP',
          //TODO: Maybe remove these since they are not required data for charge emmission for inter?
          ddd: contact.phone?.replace(/^\+/, '') || '',
          bairro: client.address.addressStreet1 || '',
          email: contact.emails.primaryEmail || '',
          complemento: '-',
          numero: '-',
        };

        const authorId = contact.id || client.id || '';

        try {
          switch (chargeAction) {
            case 'issue':
              if (charge.recurrence === ChargeRecurrence.NONE) {
                this.logger.log(
                  `Emitindo cobrança para charge ${id.slice(0, 11)}`,
                );

                const response =
                  await this.interApiService.issueChargeAndStoreAttachment(
                    workspaceId,
                    attachmentRepository,
                    {
                      id: charge.id,
                      authorId,
                      seuNumero: id.slice(0, 8),
                      valorNominal: price,
                      dataVencimento,
                      numDiasAgenda: 60,
                      pagador: { ...cliente },
                      mensagem: { linha1: '-' },
                    },
                  );

                charge.requestCode = response.codigoSolicitacao;

                this.logger.log(
                  `Cobrança emitida e attachment salvo para charge ${id}. Código: ${response.codigoSolicitacao}`,
                );
              }
              break;

            case 'cancel':
              this.logger.log(`Cancelando cobrança para charge ${id}`);

              await this.interApiService.cancelCharge(
                workspaceId,
                charge.requestCode || id,
                'Cancelamento manual',
              );
              charge.requestCode = '';
              charge.chargeAction = 'cancel';
              this.logger.log(
                `Cobrança cancelada com sucesso para charge ${id}`,
              );
              break;

            case 'none':
              this.logger.log(`Nenhuma ação necessária para charge ${id}`);
              break;

            default:
              this.logger.warn(
                `Ação desconhecida para charge ${id}: ${chargeAction}`,
              );
              break;
          }
        } catch (error) {
          charge.chargeAction = 'none';
          charge.requestCode = '';
          this.logger.error(
            `Erro processando charge ${id}: ${error.message}`,
            error.stack,
          );
        }

        await chargeRepository.save(charge);
      }),
    );
  }
}
