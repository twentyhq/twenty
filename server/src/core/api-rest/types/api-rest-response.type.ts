import { HttpException } from '@nestjs/common';

export type ApiRestResponse = {
  data: { error?: HttpException | string; status?: number };
};
