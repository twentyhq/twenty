/* eslint-disable no-case-declarations */
import { Injectable, Logger } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';

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

        const person = charge.person;
        const company = charge.company;
        const { chargeAction, id, price } = charge;
        const dataVencimento = '2025-10-21'; //temporario (campo em definição)

        if (!person || !company) {
          this.logger.warn(
            `Charge ${id} não possui relação com person ou company. Ignorando.`,
          );

          return;
        }

        const cliente = {
          telefone:
            typeof person.phones === 'string'
              ? person.phones
              : person.phones.primaryPhoneNumber || '',
          cpfCnpj: charge.taxId,
          tipoPessoa:
            charge.entityType === 'individual' ? 'FISICA' : 'JURIDICA',
          nome:
            typeof person.name === 'string'
              ? person.name
              : person.name?.firstName || '',
          cidade:
            typeof person.city === 'string' ? person.city : person.city || '',
          uf:
            typeof company.address === 'string'
              ? company.address
              : company.address?.addressState || 'SP',
          cep:
            typeof company.address === 'string'
              ? company.address
              : company.address?.addressZipCode || '18103418',
          ddd:
            typeof person.phones === 'string'
              ? person.phones
              : person.phones.primaryPhoneCallingCode?.replace(/^\+/, '') || '',
          endereco:
            typeof company.address === 'string'
              ? company.address
              : company.address?.addressStreet1 || '',
          bairro:
            typeof company.address === 'string'
              ? company.address
              : company.address?.addressStreet2 || '',
          email:
            typeof person.emails === 'string'
              ? person.emails
              : person.emails?.primaryEmail || '',
          complemento: '-',
          numero: '-',
        };

        try {
          switch (chargeAction) {
            case 'issue':
              this.logger.log(
                `Emitindo cobrança para charge ${id.slice(0, 11)}`,
              );

              const response = await this.interApiService.issueCharge(
                workspaceId,
                {
                  seuNumero: id.slice(0, 11),
                  valorNominal: price,
                  dataVencimento,
                  numDiasAgenda: 60,
                  pagador: { ...cliente },
                  mensagem: { linha1: '-' },
                },
              );

              charge.requestCode = response.codigoSolicitacao;
              this.logger.log(
                `Cobrança emitida com sucesso para charge ${id}. Código: ${response.codigoSolicitacao}`,
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
