import { applyDecorators } from '@nestjs/common';
import { Field } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { DashboardFilterBindingDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/dashboard-filter-binding.dto';

export const DashboardFilterBindingsField = () =>
  applyDecorators(
    Field(() => [DashboardFilterBindingDTO], { nullable: true }),
    IsArray(),
    ArrayUnique(
      (dashboardFilterBinding: DashboardFilterBindingDTO) =>
        dashboardFilterBinding.pageLayoutFilterId,
    ),
    ValidateNested({ each: true }),
    Type(() => DashboardFilterBindingDTO),
    IsOptional(),
  );
