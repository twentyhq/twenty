export type ServiceFn<Result, Args = void> = (args: Args) => Result;

export interface DefaultCrudService<
  CreateHandler,
  UpdateHandler,
  GetAllHandler,
  GetOneHandler,
  DeleteHandler,
> {
  create: CreateHandler;
  update: UpdateHandler;
  findAll: GetAllHandler;
  findOne: GetOneHandler;
  delete: DeleteHandler;
}
