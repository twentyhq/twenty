# Tài Liệu Twenty ORM

## Tổng Quan

Twenty ORM là một hệ thống Object-Relational Mapping (ORM) tùy chỉnh được xây dựng dựa trên TypeORM, được thiết kế riêng cho nền tảng Twenty CRM. Nó cung cấp một lớp truy cập dữ liệu nhận biết workspace, dựa trên quyền hạn với các tính năng nâng cao như tạo entity động, hỗ trợ multi-tenant, và quản lý metadata toàn diện.

## Kiến Trúc

Twenty ORM tuân theo kiến trúc phân lớp với các thành phần chính sau:

### Các Thành Phần Cốt Lõi

1. **TwentyORMManager** - Điểm vào chính cho các thao tác ORM
2. **WorkspaceDataSource** - Nguồn dữ liệu cụ thể cho workspace, mở rộng TypeORM's DataSource
3. **WorkspaceEntityManager** - Entity manager được nâng cao với kiểm tra quyền hạn
4. **WorkspaceRepository** - Pattern repository với quyền hạn tích hợp sẵn và cô lập workspace
5. **EntitySchemaFactory** - Tạo schema entity động
6. **MetadataArgsStorage** - Lưu trữ và truy xuất metadata tập trung

## Tính Năng Chính

### 1. Cô Lập Workspace

Twenty ORM cung cấp cô lập workspace hoàn toàn, đảm bảo dữ liệu từ các workspace khác nhau không bao giờ trộn lẫn:

```typescript
// Mỗi workspace có data source riêng
const workspaceDataSource = await this.workspaceDataSourceFactory.create(workspaceId);
const repository = workspaceDataSource.getRepository(EntityClass);
```

### 2. Kiểm Soát Truy Cập Dựa Trên Quyền Hạn

Tất cả thao tác database đều đi qua kiểm tra quyền hạn dựa trên vai trò người dùng:

```typescript
// Các thao tác repository tự động kiểm tra quyền hạn
const repository = await twentyOrmManager.getRepository(PersonWorkspaceEntity);
const persons = await repository.find(); // Tự động lọc dựa trên quyền hạn người dùng
```

### 3. Tạo Entity Động

Entities được tạo động dựa trên metadata, cho phép schema phát triển linh hoạt:

```typescript
// Entities được tạo từ metadata sử dụng EntitySchemaFactory
const entitySchema = await entitySchemaFactory.create(
  workspaceId,
  metadataVersion,
  objectMetadata,
  objectMetadataMaps
);
```

## Các Lớp Cốt Lõi

### TwentyORMManager

Điểm vào chính cho các thao tác ORM:

```typescript
@Injectable()
export class TwentyORMManager {
  // Lấy repository cho workspace entity
  async getRepository<T extends ObjectLiteral>(
    workspaceEntity: Type<T>
  ): Promise<WorkspaceRepository<T>>

  // Lấy workspace datasource
  async getDatasource(): Promise<WorkspaceDataSource>
}
```

**Trách nhiệm chính:**
- Tạo repository với context workspace phù hợp
- Phân giải quyền hạn dựa trên vai trò người dùng
- Quản lý context workspace

### WorkspaceDataSource

TypeORM DataSource được mở rộng với các tính năng cụ thể cho workspace:

```typescript
export class WorkspaceDataSource extends DataSource {
  readonly internalContext: WorkspaceInternalContext;
  featureFlagMap: FeatureFlagMap;
  permissionsPerRoleId: ObjectRecordsPermissionsByRoleId;

  // Lấy repository với context quyền hạn
  getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    shouldBypassPermissionChecks?: boolean,
    roleId?: string,
    authContext?: AuthContext
  ): WorkspaceRepository<Entity>
}
```

**Tính năng chính:**
- Quản lý entity trong phạm vi workspace
- Cache quyền hạn dựa trên vai trò
- Tích hợp feature flag
- Thiết kế bảo mật ưu tiên (chặn truy vấn SQL trực tiếp)

### WorkspaceRepository

Repository được nâng cao với kiểm tra quyền hạn tích hợp sẵn và cô lập workspace:

```typescript
export class WorkspaceRepository<T extends ObjectLiteral> extends Repository<T> {
  // Tất cả phương thức repository chuẩn với kiểm tra quyền hạn
  async find(options?: FindManyOptions<T>): Promise<T[]>
  async save(entity: T): Promise<T>
  async delete(criteria: any): Promise<DeleteResult>
  
  // Query builder tùy chỉnh với bộ lọc quyền hạn
  createQueryBuilder(alias?: string): WorkspaceSelectQueryBuilder<T>
}
```

**Tính năng nâng cao:**
- Lọc quyền hạn tự động
- Cô lập workspace
- Hỗ trợ nested relation
- Phát sự kiện cho mutations

### WorkspaceEntityManager

TypeORM EntityManager được mở rộng với nhận biết workspace:

```typescript
export class WorkspaceEntityManager extends EntityManager {
  // Xác thực quyền hạn cho tất cả thao tác
  validatePermissions(options: {
    target: EntityTarget<Entity> | Entity;
    operationType: OperationType;
    permissionOptions?: PermissionOptions;
    selectedColumns: string[];
  }): void

  // Tạo repository nhận biết workspace
  getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    permissionOptions?: PermissionOptions
  ): WorkspaceRepository<Entity>
}
```

## Hệ Thống Định Nghĩa Entity

### Decorators

Twenty ORM sử dụng hệ thống decorator toàn diện cho định nghĩa entity:

#### @WorkspaceEntity

Định nghĩa workspace entity với metadata:

```typescript
@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.person,
  namePlural: 'people',
  labelSingular: msg`Person`,
  labelPlural: msg`People`,
  description: msg`A person`,
  icon: 'IconUser',
})
export class PersonWorkspaceEntity extends BaseWorkspaceEntity {
  // Thuộc tính entity
}
```

**Tùy chọn:**
- `standardId`: Định danh duy nhất cho loại entity
- `namePlural`: Dạng số nhiều của tên entity
- `labelSingular/labelPlural`: Nhãn hiển thị cho UI
- `description`: Mô tả entity
- `icon`: Định danh icon UI
- `shortcut`: Phím tắt bàn phím
- `labelIdentifierStandardId`: Trường sử dụng làm định danh nhãn
- `imageIdentifierStandardId`: Trường sử dụng làm định danh hình ảnh

#### @WorkspaceField

Định nghĩa trường entity với metadata phong phú:

```typescript
@WorkspaceField({
  standardId: PERSON_STANDARD_FIELD_IDS.firstName,
  type: FieldMetadataType.TEXT,
  label: msg`First name`,
  description: msg`Contact's first name`,
  icon: 'IconUser',
  defaultValue: '',
})
firstName: string;
```

**Loại Trường:**
- `TEXT`, `EMAIL`, `PHONE`, `URL`
- `NUMBER`, `CURRENCY`, `PERCENTAGE`
- `DATE_TIME`, `DATE`
- `BOOLEAN`
- `UUID`
- `JSON`
- `SELECT`, `MULTI_SELECT`
- Và nhiều loại khác...

**Tùy Chọn Trường:**
- `standardId`: Định danh trường duy nhất
- `type`: Loại dữ liệu trường
- `label/description`: Thông tin hiển thị
- `icon`: Icon UI
- `defaultValue`: Giá trị mặc định
- `options`: Tùy chọn cụ thể theo loại
- `settings`: Cài đặt trường
- `isActive`: Trường có hoạt động hay không
- `generatedType`: Cho các trường được tính toán

#### @WorkspaceRelation

Định nghĩa mối quan hệ giữa các entity:

```typescript
@WorkspaceRelation({
  standardId: PERSON_STANDARD_FIELD_IDS.company,
  type: RelationType.MANY_TO_ONE,
  label: msg`Company`,
  description: msg`Person's company`,
  icon: 'IconBuildingSkyscraper',
  inverseSideTarget: () => CompanyWorkspaceEntity,
  inverseSideFieldKey: 'people',
  onDelete: RelationOnDeleteAction.SET_NULL,
})
company: CompanyWorkspaceEntity | null;
```

**Loại Quan Hệ:**
- `ONE_TO_MANY`: Một cha, nhiều con
- `MANY_TO_ONE`: Nhiều entity chỉ đến một cha

**Tùy Chọn:**
- `standardId`: Định danh quan hệ duy nhất
- `type`: Loại quan hệ
- `label/description`: Thông tin hiển thị
- `inverseSideTarget`: Lớp entity đích
- `inverseSideFieldKey`: Tên trường ở phía ngược lại
- `onDelete`: Hành vi cascade

#### Property Decorators

Các decorator bổ sung cho thuộc tính trường:

```typescript
// Đánh dấu trường có thể null
@WorkspaceIsNullable()
middleName: string | null;

// Đánh dấu trường hệ thống
@WorkspaceIsSystem()
createdAt: string;

// Đánh dấu trường chính (sử dụng làm định danh bản ghi)
@WorkspaceIsPrimaryField()
id: string;

// Đánh dấu trường duy nhất
@WorkspaceIsUnique()
email: string;

// Đánh dấu trường đã lỗi thời
@WorkspaceIsDeprecated()
oldField: string;

// Đánh dấu trường không ghi audit log
@WorkspaceIsNotAuditLogged()
temporaryField: string;

// Đánh dấu trường có thể tìm kiếm
@WorkspaceIsSearchable()
searchableField: string;
```

### Lớp Cơ Sở

#### BaseWorkspaceEntity

Tất cả workspace entities đều kế thừa từ lớp cơ sở này:

```typescript
export abstract class BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.id,
    type: FieldMetadataType.UUID,
    label: msg`Id`,
    defaultValue: 'uuid',
  })
  @WorkspaceIsPrimaryField()
  @WorkspaceIsSystem()
  id: string;

  @WorkspaceField({
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Creation date`,
    defaultValue: 'now',
  })
  createdAt: string;

  @WorkspaceField({
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Last update`,
    defaultValue: 'now',
  })
  updatedAt: string;

  @WorkspaceField({
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.deletedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Deleted at`,
  })
  @WorkspaceIsNullable()
  deletedAt: string | null;
}
```

## Patterns Truy Cập Dữ Liệu

### Repository Pattern

```typescript
// Lấy instance repository
const personRepository = await twentyORMManager.getRepository(PersonWorkspaceEntity);

// Các thao tác CRUD cơ bản
const person = await personRepository.save({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
});

const people = await personRepository.find({
  where: { company: { id: companyId } },
  relations: ['company']
});

await personRepository.delete(person.id);
```

### Query Builder

```typescript
const queryBuilder = personRepository
  .createQueryBuilder('person')
  .leftJoinAndSelect('person.company', 'company')
  .where('person.firstName = :firstName', { firstName: 'John' })
  .andWhere('company.name ILIKE :companyName', { companyName: '%Tech%' });

const results = await queryBuilder.getMany();
```

### Thao Tác Nâng Cao

```typescript
// Thao tác hàng loạt
await personRepository.update(
  { company: { id: oldCompanyId } },
  { company: { id: newCompanyId } }
);

// Soft delete
await personRepository.softDelete({ id: personId });

// Khôi phục bản ghi đã soft-delete
await personRepository.restore({ id: personId });

// Tập hợp dữ liệu
const count = await personRepository.count({
  where: { company: { id: companyId } }
});

const avgAge = await personRepository.average('age', {
  company: { id: companyId }
});
```

## Hệ Thống Quyền Hạn

### Loại Quyền Hạn

Twenty ORM triển khai kiểm soát quyền hạn chi tiết:

1. **Quyền hạn cấp object**: Create, Read, Update, Delete
2. **Quyền hạn cấp field**: Kiểm soát truy cập đến các trường cụ thể
3. **Quyền hạn cấp record**: Bảo mật cấp hàng dựa trên quyền sở hữu

### Luồng Kiểm Tra Quyền Hạn

1. Người dùng tạo request → Context workspace được thiết lập
2. Vai trò được xác định từ thành viên workspace của người dùng
3. Quyền hạn được tải cho vai trò
4. Thao tác repository → Xác thực quyền hạn
5. Thực thi truy vấn với bộ lọc quyền hạn được áp dụng

### Bỏ Qua Quyền Hạn

Đối với các thao tác hệ thống, có thể bỏ qua quyền hạn:

```typescript
// Lấy repository với bỏ qua quyền hạn
const repository = workspaceDataSource.getRepository(
  EntityClass,
  true, // shouldBypassPermissionChecks
);
```

## Hệ Thống Metadata

### MetadataArgsStorage

Lưu trữ trung tâm cho metadata entity:

```typescript
export class MetadataArgsStorage {
  // Lưu trữ định nghĩa entity
  addEntities(...entities: WorkspaceEntityMetadataArgs[]): void
  
  // Lưu trữ định nghĩa field
  addFields(...fields: WorkspaceFieldMetadataArgs[]): void
  
  // Lưu trữ định nghĩa relation
  addRelations(...relations: WorkspaceRelationMetadataArgs[]): void
  
  // Truy xuất metadata theo target
  filterEntities(target: Function | string): WorkspaceEntityMetadataArgs[]
  filterFields(target: Function | string): WorkspaceFieldMetadataArgs[]
  filterRelations(target: Function | string): WorkspaceRelationMetadataArgs[]
}
```

### Tạo Schema Động

Entities được tạo động từ metadata:

```typescript
// EntitySchemaFactory tạo TypeORM EntitySchema từ metadata
const entitySchema = await entitySchemaFactory.create(
  workspaceId,
  metadataVersion,
  objectMetadata,
  objectMetadataMaps
);

// Schema bao gồm columns, relations, và indexes
const schema = new EntitySchema({
  name: objectMetadata.nameSingular,
  tableName: computeTableName(objectMetadata.nameSingular, objectMetadata.isCustom),
  columns: generatedColumns,
  relations: generatedRelations,
});
```

## Tính Năng Nâng Cao

### Truy Vấn Nested Relation

Hỗ trợ các thao tác nested relation phức tạp:

```typescript
// Lưu với nested relations
await repository.save({
  firstName: 'John',
  lastName: 'Doe',
  company: {
    connect: { id: existingCompanyId }
  },
  activities: {
    create: [
      { name: 'Initial contact', type: 'call' }
    ]
  }
});
```

### Hệ Thống Event

Phát sự kiện tự động cho các mutations dữ liệu:

```typescript
// Sự kiện được phát tự động cho:
// - CREATED: Bản ghi mới
// - UPDATED: Bản ghi được sửa đổi
// - DELETED: Bản ghi soft-deleted
// - DESTROYED: Bản ghi hard-deleted
// - RESTORED: Bản ghi được khôi phục

// Sự kiện bao gồm context workspace và dữ liệu entity
await eventEmitterService.emitMutationEvent({
  action: DatabaseEventAction.CREATED,
  objectMetadataItem,
  workspaceId,
  entities: [newEntity]
});
```

### Tích Hợp Feature Flag

Feature flags kiểm soát hành vi ORM:

```typescript
// Feature flags được kiểm tra trong quá trình thực thi truy vấn
const featureFlagMap = workspaceDataSource.featureFlagMap;

if (featureFlagMap[FeatureFlagKeys.IS_ADVANCED_FILTER_ENABLED]) {
  // Áp dụng logic lọc nâng cao
}
```

### Quản Lý Schema Workspace

Quản lý schema database động cho mỗi workspace:

```typescript
// Schema manager xử lý các thao tác DDL
await workspaceSchemaManager.createTable(objectMetadata);
await workspaceSchemaManager.alterTable(objectMetadata, changes);
await workspaceSchemaManager.dropTable(objectMetadata);

// Quản lý index
await workspaceSchemaManager.createIndex(indexMetadata);
await workspaceSchemaManager.dropIndex(indexName);
```

## Cân Nhắc Bảo Mật

### Phòng Chống SQL Injection

Twenty ORM phòng chống SQL injection thông qua:

1. **Truy vấn có tham số**: Tất cả đầu vào người dùng được tham số hóa
2. **Query builder**: Xây dựng truy vấn type-safe
3. **Bộ lọc quyền hạn**: Lọc truy vấn tự động
4. **Chặn truy vấn thô**: Truy vấn SQL trực tiếp bị chặn

### Thực Thi Quyền Hạn

Tất cả truy cập dữ liệu đều đi qua kiểm tra quyền hạn:

```typescript
// Xác thực quyền hạn là bắt buộc
validateOperationIsPermittedOrThrow({
  entityName,
  operationType: 'read',
  objectRecordsPermissions,
  selectedColumns,
});
```

### Cô Lập Workspace

Cô lập dữ liệu hoàn toàn giữa các workspace:

- Schema database riêng biệt cho mỗi workspace
- Context workspace cần thiết cho tất cả thao tác
- Truy cập dữ liệu giữa workspace là không thể

## Xử Lý Lỗi

### Exception Tùy Chỉnh

```typescript
// Permission exceptions
throw new PermissionsException(
  'Insufficient permissions',
  PermissionsExceptionCode.INSUFFICIENT_PERMISSIONS
);

// Relation exceptions
throw new RelationException(
  'Invalid relation configuration',
  RelationExceptionCode.RELATION_NOT_FOUND
);

// Twenty ORM exceptions
throw new TwentyORMException(
  'ORM operation failed',
  TwentyORMExceptionCode.INVALID_QUERY
);
```

### Thực Hành Tốt Xử Lý Lỗi

1. **Luôn bắt và xử lý exception** từ các thao tác ORM
2. **Sử dụng loại exception cụ thể** cho các danh mục lỗi khác nhau
3. **Cung cấp thông báo lỗi có ý nghĩa** để debug
4. **Ghi log lỗi phù hợp** để theo dõi

## Cân Nhắc Hiệu Suất

### Connection Pooling

```typescript
// Pool kết nối chia sẻ giữa các workspace
@Module({
  imports: [PgPoolSharedModule]
})
export class TwentyORMModule {}
```

### Tối Ưu Truy Vấn

1. **Sử dụng indexes phù hợp** trên các trường được truy vấn thường xuyên
2. **Giới hạn tập kết quả** với phân trang
3. **Sử dụng select trường cụ thể** thay vì select tất cả
4. **Tối ưu tải relation** với chiến lược join phù hợp

### Caching

1. **Cache metadata**: Entity metadata được cache
2. **Cache quyền hạn**: Quyền hạn được cache theo vai trò
3. **Cache feature flag**: Feature flags được cache theo workspace
4. **Cache schema**: Schemas được tạo được cache

## Migration và Evolution

### Schema Evolution

Twenty ORM hỗ trợ schema evolution thông qua:

1. **Thay đổi điều khiển metadata**: Thay đổi schema thông qua cập nhật metadata
2. **Migration tự động**: Cập nhật schema database
3. **Khả năng tương thích ngược**: Xử lý thay đổi schema một cách duyên dáng
4. **Quản lý phiên bản**: Hệ thống versioning metadata

### Data Migration

```typescript
// Tiện ích migration cho chuyển đổi dữ liệu
await workspaceMigrationRunner.run(workspaceId, migrationScripts);
```

## Testing

### Unit Testing

```typescript
// Mock repositories để testing
const mockRepository = {
  find: jest.fn().mockResolvedValue([mockPerson]),
  save: jest.fn().mockResolvedValue(mockPerson),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

// Test với dependencies được mock
const service = new PersonService(mockRepository);
const result = await service.findAll();
```

### Integration Testing

```typescript
// Test với kết nối database thực
describe('PersonRepository Integration', () => {
  beforeEach(async () => {
    await testingModule.create();
    repository = testingModule.get(PersonRepository);
  });
  
  it('should create and retrieve person', async () => {
    const person = await repository.save(mockPersonData);
    const retrieved = await repository.findOne({ where: { id: person.id } });
    expect(retrieved).toEqual(person);
  });
});
```

## Thực Hành Tốt

### Thiết Kế Entity

1. **Sử dụng tên entity mô tả** phản ánh domain business
2. **Giữ entities tập trung** vào một trách nhiệm duy nhất
3. **Sử dụng loại field phù hợp** cho dữ liệu
4. **Định nghĩa mối quan hệ rõ ràng** giữa các entity
5. **Thêm validation và constraints phù hợp**

### Sử Dụng Repository

1. **Sử dụng repository pattern** thay vì truy cập entity manager trực tiếp
2. **Xử lý lỗi phù hợp** với try-catch blocks
3. **Sử dụng transactions** cho các thao tác nhiều bước
4. **Tối ưu truy vấn** với lọc và phân trang phù hợp
5. **Tận dụng query builder** cho các truy vấn phức tạp

### Hiệu Suất

1. **Sử dụng lazy loading** cho các tập relation lớn
2. **Triển khai indexing phù hợp** trên các trường được truy vấn thường xuyên
3. **Sử dụng bulk operations** cho các tập dữ liệu lớn
4. **Cache dữ liệu được truy cập thường xuyên** khi phù hợp
5. **Theo dõi hiệu suất truy vấn** và tối ưu các truy vấn chậm

### Bảo Mật

1. **Không bao giờ bỏ qua quyền hạn** trừ khi thực sự cần thiết
2. **Xác thực tất cả dữ liệu đầu vào** trước thao tác database
3. **Sử dụng truy vấn có tham số** để phòng chống SQL injection
4. **Triển khai audit logging phù hợp** cho các thao tác nhạy cảm
5. **Tuân theo nguyên tắc least privilege** cho truy cập database

## Khắc Phục Sự Cố

### Vấn Đề Thường Gặp

1. **Lỗi Từ Chối Quyền Hạn**
   - Kiểm tra vai trò người dùng và quyền hạn
   - Xác minh context workspace đúng
   - Đảm bảo phân vai trò phù hợp

2. **Không Tìm Thấy Entity**
   - Xác minh entity được decorate đúng
   - Kiểm tra đăng ký metadata
   - Xác nhận workspace có entity được bật

3. **Vấn Đề Tải Relation**
   - Kiểm tra relation decorators đúng
   - Xác minh cấu hình inverse side
   - Đảm bảo điều kiện join phù hợp

4. **Vấn Đề Hiệu Suất**
   - Thêm database indexes nơi cần thiết
   - Tối ưu điều kiện truy vấn
   - Sử dụng phân trang cho tập kết quả lớn
   - Kiểm tra vấn đề N+1 query

### Mẹo Debug

1. **Bật query logging** để xem SQL được tạo
2. **Sử dụng profiler** để xác định các thao tác chậm
3. **Kiểm tra database logs** để tìm lỗi
4. **Xác minh đăng ký metadata** trong quá trình khởi động
5. **Test với tập dữ liệu tối thiểu** để cô lập vấn đề

## Kết Luận

Twenty ORM cung cấp một lớp truy cập dữ liệu mạnh mẽ, an toàn và linh hoạt được thiết kế đặc biệt cho các ứng dụng CRM multi-tenant. Kiến trúc nhận biết workspace, hệ thống quyền hạn toàn diện, và khả năng tạo schema động của nó làm cho nó trở nên lý tưởng để xây dựng các ứng dụng SaaS có thể mở rộng với các yêu cầu dữ liệu phức tạp.

Sự nhấn mạnh của hệ thống vào bảo mật, hiệu suất, và trải nghiệm developer đảm bảo rằng các ứng dụng được xây dựng trên Twenty ORM có thể mở rộng hiệu quả trong khi vẫn duy trì tính toàn vẹn dữ liệu và bảo mật người dùng.