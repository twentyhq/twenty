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
        chargeRepository.findOneByOrFail({ id: event.recordId }),
      ),
    );

    await Promise.all(
      charges.map(async (charge) => {
        const { cancelPayment, integrationId, id, price } = charge;

        const dataVencimento = '2025-10-21';

        const cliente = {
          telefone: '99999999',
          cpfCnpj: '01123456789',
          nome: 'Cliente Teste',
          cidade: 'São Paulo',
          uf: 'SP' as const,
          cep: '01001000',
          ddd: '51',
          endereco: 'Avenida Brasil, 1200',
          bairro: 'Centro',
          email: 'nome.sobrenome@x.com.br',
          complemento: 'apartamento 3 bloco 4',
          numero: '311',
        };

        try {
          const shouldCancelCharge = cancelPayment === 'inactive';
          const shouldEmitCharge =
            cancelPayment === 'active' || !!integrationId;

          if (shouldCancelCharge) {
            this.logger.log(
              `Charge ${id} — cancelPayment === 'inactive' → Cancelando cobrança`,
            );
            await this.interApiService.cancelCharge(
              id,
              'Devedor pagou por outra forma',
            );
          }

          if (shouldEmitCharge && !shouldCancelCharge) {
            this.logger.log(
              `Charge ${id} — integrationId existe ou cancelPayment === 'active' → Emitindo cobrança`,
            );

            this.logger.log(`Charge Client ${cliente}`);

            const testeID = id.slice(0, 11);

            this.logger.log(`Parametros ID: ${testeID} VALOR: ${price} `);

            await this.interApiService.issueCharge({
              seuNumero: id.slice(0, 11),
              valorNominal: price,
              dataVencimento,
              numDiasAgenda: 60,
              pagador: {
                cpfCnpj: cliente.cpfCnpj,
                tipoPessoa: 'FISICA',
                nome: cliente.nome,
                cidade: cliente.cidade,
                uf: cliente.uf,
                cep: cliente.cep,
                telefone: cliente.telefone,
                ddd: '31',
                bairro: cliente.bairro,
                endereco: cliente.endereco,
                email: cliente.email,
                complemento: cliente.complemento,
                numero: cliente.numero,
              },
              mensagem: {
                linha1: 'mensagem 1',
              },
            });

            this.logger.log(`Succes !!!!!`);
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

    return;
  }
}
