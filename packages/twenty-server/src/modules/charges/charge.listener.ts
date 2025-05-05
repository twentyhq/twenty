/* eslint-disable no-case-declarations */
import { Injectable, Logger } from '@nestjs/common';

import { Repository } from 'typeorm';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';

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

    const productRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ProductWorkspaceEntity>(
        workspaceId,
        'product',
      );

    const charges = await Promise.all(
      events.map((event) =>
        chargeRepository.findOne({
          where: { id: event.recordId },
          relations: ['product'],
        }),
      ),
    );

    await Promise.all(
      charges.map(async (charge) => {
        if (!charge) {
          this.logger.warn(`Charge not found for recordId: ${charge}`);

          return;
        }

        const { chargeAction, id, price, productId } = charge;
        const dataVencimento = '2025-10-21';
        const cliente = {
          telefone: '99999999',
          cpfCnpj: '01123456789',
          tipoPessoa: 'FISICA' as const,
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
          switch (chargeAction) {
            case 'issue':
              this.logger.log(
                `Emitindo cobrança para charge ${id.slice(0, 11)}`,
              );

              const response = await this.interApiService.issueCharge({
                seuNumero: id.slice(0, 11),
                valorNominal: price,
                dataVencimento,
                numDiasAgenda: 60,
                pagador: { ...cliente },
                mensagem: { linha1: 'mensagem 1' },
              });

              charge.requestCode = response.codigoSolicitacao;
              this.logger.log(
                `Cobrança emitida com sucesso para charge ${id}. Código: ${response.codigoSolicitacao}`,
              );

              if (productId) {
                await this.updateProductStatus(
                  productRepository,
                  productId,
                  'active',
                );
                this.logger.log(
                  `Status do produto ${productId} atualizado para ATIVO`,
                );
              }
              break;

            case 'cancel':
              this.logger.log(`Cancelando cobrança para charge ${id}`);
              await this.interApiService.cancelCharge(
                charge.requestCode || id,
                'Cancelamento manual',
              );
              this.logger.log(
                `Cobrança cancelada com sucesso para charge ${id}`,
              );

              if (productId) {
                await this.updateProductStatus(
                  productRepository,
                  productId,
                  'active',
                );
                this.logger.log(
                  `Status do produto ${productId} atualizado para INATIVO`,
                );
              }
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

  private async updateProductStatus(
    productRepository: Repository<ProductWorkspaceEntity>,
    productId: string,
    status: 'active' | 'inactive',
  ): Promise<void> {
    try {
      await productRepository.update({ id: productId }, { status });
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar status do produto ${productId}: ${error.message}`,
      );
      throw error;
    }
  }
}
