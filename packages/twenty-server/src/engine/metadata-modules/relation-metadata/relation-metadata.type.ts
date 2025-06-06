export enum RelationMetadataType {
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_ONE = 'MANY_TO_ONE',
}

export enum RelationOnDeleteAction {
  CASCADE = 'CASCADE',
  RESTRICT = 'RESTRICT',
  SET_NULL = 'SET_NULL',
  NO_ACTION = 'NO_ACTION',
}
