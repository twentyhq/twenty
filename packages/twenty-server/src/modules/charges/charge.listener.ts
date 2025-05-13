/* eslint-disable no-case-declarations */
import { Injectable, Logger } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import {
  FlattenedCompany,
  FlattenedPerson,
} from 'src/modules/charges/types/inter';

import { InterApiService } from './inter/inter-api.service';
import { ChargeWorkspaceEntity } from './standard-objects/charge.workspace-entity';

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
    const { workspaceId, name: eventName, events } = payload;

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
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<any>(
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

        const person = charge.person as FlattenedPerson;
        const company = charge.company as FlattenedCompany;

        const { chargeAction, id, price } = charge;
        const dataVencimento = '2025-10-21'; //temporario

        if (!person || !company) {
          this.logger.warn(
            `Charge ${id} não possui relação com person ou company. Ignorando.`,
          );

          charge.chargeAction = 'none';

          return;
        }

        this.logger.log('person', company);

        const cliente = {
          telefone: person.phonesPrimaryPhoneNumber || '',
          cpfCnpj: charge.taxId.replace(/\D/g, ''),
          tipoPessoa:
            charge.entityType === 'individual' ? 'FISICA' : 'JURIDICA',
          nome: person.nameFirstName || '',
          cidade: person.city || '',
          uf: company.addressAddressState || 'SP',
          cep: company.addressAddressPostcode || '18103418',
          ddd: person.phonesPrimaryPhoneCallingCode?.replace(/^\+/, '') || '',
          endereco: company.addressAddressStreet1 || 'Rua ...',
          bairro: company.addressAddressStreet2 || '',
          email: person.emailsPrimaryEmail || '',
          complemento: '-',
          numero: '-',
        };

        const authorId =
          person.createdByWorkspaceMemberId ||
          company.createdByWorkspaceMemberId ||
          '';

        try {
          switch (chargeAction) {
            case 'issue':
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
