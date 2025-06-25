import { InterCustomerType } from 'src/engine/core-modules/inter/interfaces/charge.interface';

import { ChargeEntityType } from 'src/modules/charges/standard-objects/charge.workspace-entity';

export const chargeEntityTypeToInterCustomerTypeMap = (
  entityType: ChargeEntityType,
) =>
  ({
    [ChargeEntityType.INDIVIDUAL]: InterCustomerType.FISICA,
    [ChargeEntityType.COMPANY]: InterCustomerType.JURIDICA,
  })[entityType];
