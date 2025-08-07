import { Injectable } from '@nestjs/common';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  Customer,
  CustomerConnection,
  CustomerFiltersInput,
  CustomerListRestResponse
} from './dto/customer.dto';
import { MktCustomerWorkspaceEntity } from './entities/customer.workspace-entity';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

@Injectable()
export class CustomersService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  private toCustomerDto(entity: MktCustomerWorkspaceEntity): Customer {
    return {
      id: entity.id,
      name: entity.name,
      customerType: entity.customerType || undefined,
      customerEmailPrimaryEmail: entity.customerEmailPrimaryEmail || undefined,
      customerPhonePrimaryPhoneNumber: entity.customerPhonePrimaryPhoneNumber || undefined,
      taxCode: entity.taxCode || undefined,
      company: entity.companyName || undefined,
      address: entity.customerAddress || undefined,
      customerStatus: entity.customerStatus || undefined,
      customerTier: entity.customerTier || undefined,
      customerLifecycleStage: entity.customerLifecycleStage || undefined,
      customerTotalOrderValue: entity.customerTotalOrderValue || undefined,
      customerTags: entity.customerTags || undefined,
      customerTest: entity.customerTest || undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      workspaceId: '', // Workspace ID is managed by Twenty ORM
    };
  }

  async findAll(
    workspaceId: string,
    filters?: CustomerFiltersInput,
    pagination?: PaginationParams,
  ): Promise<CustomerConnection> {
    const repository = await this.twentyORMManager.getRepository(MktCustomerWorkspaceEntity);
    
    let queryBuilder = repository.createQueryBuilder('customer');

    // Apply filters
    if (filters?.name) {
      queryBuilder = queryBuilder.andWhere('customer.name ILIKE :name', { 
        name: `%${filters.name}%` 
      });
    }
    if (filters?.customerType) {
      queryBuilder = queryBuilder.andWhere('customer.customerType ILIKE :customerType', { 
        customerType: `%${filters.customerType}%` 
      });
    }
    if (filters?.email) {
      queryBuilder = queryBuilder.andWhere("customer.customerEmailPrimaryEmail ILIKE :email", { 
        email: `%${filters.email}%` 
      });
    }
    if (filters?.company) {
      queryBuilder = queryBuilder.andWhere('customer.companyName ILIKE :company', { 
        company: `%${filters.company}%` 
      });
    }
    if (filters?.customerStatus) {
      queryBuilder = queryBuilder.andWhere('customer.customerStatus ILIKE :customerStatus', { 
        customerStatus: `%${filters.customerStatus}%` 
      });
    }
    if (filters?.customerTier) {
      queryBuilder = queryBuilder.andWhere('customer.customerTier ILIKE :customerTier', { 
        customerTier: `%${filters.customerTier}%` 
      });
    }
    if (filters?.customerLifecycleStage) {
      queryBuilder = queryBuilder.andWhere('customer.customerLifecycleStage ILIKE :customerLifecycleStage', { 
        customerLifecycleStage: `%${filters.customerLifecycleStage}%` 
      });
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = (page - 1) * limit;

    queryBuilder = queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('customer.createdAt', 'DESC');

    const [entities, totalCount] = await queryBuilder.getManyAndCount();
    
    const data = entities.map(entity => this.toCustomerDto(entity as MktCustomerWorkspaceEntity));
    const hasNextPage = (page * limit) < totalCount;
    const hasPreviousPage = page > 1;

    return {
      data,
      totalCount,
      hasNextPage,
      hasPreviousPage,
      // pageInfo: {
      //   page,
      //   limit,
      //   totalPages: Math.ceil(totalCount / limit),
      // },
    };
  }

  // REST API specific methods
  async findAllForRest(
    workspaceId: string,
    filters?: CustomerFiltersInput,
    pagination?: PaginationParams,
  ): Promise<CustomerListRestResponse> {
    const result = await this.findAll(workspaceId, filters, pagination);
    return {
      success: true,
      data: result.data,
      // meta: {
        // total: result.totalCount,
        // page: result.pageInfo.page,
        // limit: result.pageInfo.limit,
        // totalPages: result.pageInfo.totalPages,
        // hasNextPage: result.hasNextPage,
        // hasPreviousPage: result.hasPreviousPage,
      // },
      message: 'Customers retrieved successfully',
    };
  }
}
