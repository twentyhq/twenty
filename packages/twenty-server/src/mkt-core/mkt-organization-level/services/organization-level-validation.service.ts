import { Injectable, BadRequestException } from '@nestjs/common';

import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

import { CreateOrganizationLevelDto } from 'src/mkt-core/mkt-organization-level/dto/create-organization-level.dto';
import { UpdateOrganizationLevelDto } from 'src/mkt-core/mkt-organization-level/dto/update-organization-level.dto';

@Injectable()
export class OrganizationLevelValidationService {
  async validateCreateInput(
    input: Record<string, unknown>,
  ): Promise<CreateOrganizationLevelDto> {
    const dto = plainToClass(CreateOrganizationLevelDto, input);
    const errors = await validate(dto);

    if (errors.length > 0) {
      throw new BadRequestException(this.formatValidationErrors(errors));
    }

    return dto;
  }

  async validateUpdateInput(
    input: Record<string, unknown>,
  ): Promise<UpdateOrganizationLevelDto> {
    const dto = plainToClass(UpdateOrganizationLevelDto, input);
    const errors = await validate(dto);

    if (errors.length > 0) {
      throw new BadRequestException(this.formatValidationErrors(errors));
    }

    return dto;
  }

  private formatValidationErrors(errors: ValidationError[]): string {
    const messages = errors.map((error) => {
      if (error.constraints) {
        return Object.values(error.constraints).join(', ');
      }

      return `Invalid value for ${error.property}`;
    });

    return messages.join('; ');
  }
}
