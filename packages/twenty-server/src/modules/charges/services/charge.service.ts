import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';

import { validate } from 'class-validator';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { InterCustomerUf } from 'src/engine/core-modules/inter/interfaces/charge.interface';

import { getNextBusinessDays } from 'src/engine/core-modules/inter/utils/get-next-business-days.util';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { ChargeEmmitBillDataDto } from 'src/modules/charges/inter/dtos/charge-emmit-bill-data.dto';
import { InterApiService } from 'src/modules/charges/inter/services/inter-api.service';
import { chargeEntityTypeToInterCustomerTypeMap } from 'src/modules/charges/inter/utils/charge-entity-type-to-inter-cusotmer-type-map';
import {
  ChargeAction,
  ChargeRecurrence,
  ChargeWorkspaceEntity,
} from 'src/modules/charges/standard-objects/charge.workspace-entity';

@Injectable()
export class ChargeService {
  private readonly logger = new Logger(ChargeService.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly interApiService: InterApiService,
  ) {}

  async getWorkspaceChargesMapByRecurrence(recurrence: ChargeRecurrence) {
    this.logger.log(`Mapping workspace ${recurrence} charges to emmit`);

    let workspaceChargesMap: Record<string, string[]> = {};

    const workspaces = await this.workspaceRepository.find({
      select: {
        id: true,
      },
    });

    for (const workspace of workspaces) {
      const chargeWorkspaceEntityRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChargeWorkspaceEntity>(
          workspace.id,
          'charge',
        );

      const filteredCharges = await chargeWorkspaceEntityRepository.find({
        where: {
          recurrence,
          chargeAction: ChargeAction.ISSUE,
        },
        select: {
          id: true,
        },
      });

      if (filteredCharges.length > 0) {
        this.logger.log(
          `Workspace ${workspace.id} has ${filteredCharges.length} charges to be issued.`,
        );
        workspaceChargesMap = {
          ...workspaceChargesMap,
          [workspace.id]: filteredCharges.map((charge) => charge.id),
        };
      }
    }

    return workspaceChargesMap;
  }

  async emmitChargeBill({
    chargeId,
    workspaceId,
  }: {
    workspaceId: string;
    chargeId: string;
  }) {
    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!isDefined(workspace))
      throw new Error(`Workspace ${workspaceId} not found`);

    const chargeWorkspaceEntityRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChargeWorkspaceEntity>(
        workspace.id,
        'charge',
      );

    const charge = await chargeWorkspaceEntityRepository.findOne({
      where: {
        id: chargeId,
      },
      relations: {
        person: true,
        company: true,
      },
    });

    if (!isDefined(charge)) throw new Error(`Charge ${chargeId} not found`);

    // TODO: Move this inside the service
    const attachmentRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AttachmentWorkspaceEntity>(
        workspaceId,
        'attachment',
      );

    const { name, cpfCnpj, legalEntity, address, cep, city, stateUnity } =
      await this.mapAndValidateChargeData(charge);

    await this.interApiService.issueChargeAndStoreAttachment(
      workspaceId,
      attachmentRepository,
      {
        id: randomUUID().slice(0, 15),
        seuNumero: randomUUID().slice(0, 15),
        authorId: charge?.person?.id as string,
        dataVencimento: getNextBusinessDays(5),
        valorNominal: charge.price,
        numDiasAgenda: 60,
        pagador: {
          nome: name,
          cpfCnpj,
          tipoPessoa: legalEntity,
          endereco: address,
          cep,
          cidade: city,
          uf: stateUnity,
        },
      },
    );
  }

  async mapAndValidateChargeData(
    charge: ChargeWorkspaceEntity,
  ): Promise<ChargeEmmitBillDataDto> {
    // TODO: Any throws shoudl create an timeline activity to the charge informing what happened and should make the charge get a special status to retry then later
    const contact = charge.person;

    if (!isDefined(contact))
      throw new Error(`Charge ${charge.id} missing contact information`);

    const client = charge.company;

    if (!isDefined(client))
      throw new Error(`Charge ${charge.id} missing client information`);

    const chargeData = new ChargeEmmitBillDataDto();

    chargeData.name = client.name;
    chargeData.cpfCnpj = (client.cpfCnpj as string)?.replace(/\D/, '');
    chargeData.legalEntity = chargeEntityTypeToInterCustomerTypeMap(
      charge.entityType,
    );
    chargeData.cep =
      client.address.addressZipCode?.replace(/\D/, '') || '18087686';
    chargeData.address = client.address.addressStreet1;
    chargeData.city = client.address.addressCity;
    chargeData.stateUnity = client.address.addressState as InterCustomerUf;

    await validate(chargeData);

    return chargeData;
  }
}
