// Distinct machine codes per rejection reason so clients can react correctly
// (only BOUND_TO_ANOTHER_SERVER means another server owns the key).
export {
  ENTERPRISE_SERVER_BINDING_REJECTION_CODE as SERVER_BINDING_REJECTION_CODE,
  type EnterpriseServerBindingRejectionCode as ServerBindingRejectionCode,
} from 'twenty-shared/constants';
