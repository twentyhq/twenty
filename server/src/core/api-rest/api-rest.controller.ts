import { Controller, Get } from '@nestjs/common';

@Controller('api/*')
export class ApiRestController {
  @Get()
  handleApiGet(): string {
    return 'get handled';
  }
}
