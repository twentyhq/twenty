import { CustomError } from '@/utils/errors/CustomError';

export class InvalidDashboardFilterError extends CustomError {
  constructor(message: string) {
    super(message, 'INVALID_DASHBOARD_FILTER');
  }
}
