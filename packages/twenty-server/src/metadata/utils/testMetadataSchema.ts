import { makeExecutableSchema } from '@graphql-tools/schema';

export const testMetadataSchema = makeExecutableSchema({
  typeDefs: [
    `
schema {
  query: Query
  mutation: Mutation
}`,
    `type RefreshToken {
  id: ID!
  expiresAt: DateTime!
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""
A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format.
"""
scalar DateTime


type FullName {
  firstName: String!
  lastName: String!
}

type WorkspaceMember {
  id: ID!
  name: FullName!
  colorScheme: String!
  avatarUrl: String
  locale: String!
}

type User {
  id: ID!
  firstName: String!
  lastName: String!
  email: String!
  emailVerified: Boolean!
  disabled: Boolean
  passwordHash: String
  canImpersonate: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  deletedAt: DateTime
  defaultWorkspace: Workspace!
  passwordResetToken: String
  passwordResetTokenExpiresAt: DateTime
  workspaceMember: WorkspaceMember!
  supportUserHash: String
}

type Workspace {
  id: ID!
  domainName: String
  displayName: String
  logo: String
  inviteHash: String
  deletedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
  allowImpersonation: Boolean!
  subscriptionStatus: String!
}

type relation {
  id: ID!
  relationType: RelationMetadataType!
  fromObjectMetadataId: String!
  toObjectMetadataId: String!
  fromFieldMetadataId: String!
  toFieldMetadataId: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  fromObjectMetadata: object!
  toObjectMetadata: object!
}

"""Type of the relation"""
enum RelationMetadataType {
  ONE_TO_ONE
  ONE_TO_MANY
  MANY_TO_MANY
}

type field {
  id: ID!
  type: FieldMetadataType!
  name: String!
  label: String!
  description: String
  icon: String
  isCustom: Boolean
  isActive: Boolean
  isSystem: Boolean
  isNullable: Boolean
  defaultValue: JSON
  options: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
  toRelationMetadata: relation
  fromRelationMetadata: relation
}

"""Type of the field"""
enum FieldMetadataType {
  UUID
  TEXT
  PHONE
  EMAIL
  DATE_TIME
  BOOLEAN
  NUMBER
  NUMERIC
  PROBABILITY
  LINK
  CURRENCY
  FULL_NAME
  RATING
  SELECT
  MULTI_SELECT
  RELATION
}

"""
The \`JSON\` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
"""
scalar JSON

type object {
  id: ID!
  dataSourceId: String!
  nameSingular: String!
  namePlural: String!
  labelSingular: String!
  labelPlural: String!
  description: String
  icon: String
  isCustom: Boolean!
  isActive: Boolean!
  isSystem: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  labelIdentifierFieldMetadataId: String
  imageIdentifierFieldMetadataId: String
  fields(
    """Limit or page results."""
    paging: CursorPaging! = {first: 10}

    """Specify to filter the records returned."""
    filter: fieldFilter! = {}
  ): ObjectFieldsConnection!
}

input CursorPaging {
  """Paginate before opaque cursor"""
  before: ConnectionCursor

  """Paginate after opaque cursor"""
  after: ConnectionCursor

  """Paginate first"""
  first: Int

  """Paginate last"""
  last: Int
}

"""Cursor for paging through collections"""
scalar ConnectionCursor

input fieldFilter {
  and: [fieldFilter!]
  or: [fieldFilter!]
  id: IDFilterComparison
  isCustom: BooleanFieldComparison
  isActive: BooleanFieldComparison
  isSystem: BooleanFieldComparison
}

input IDFilterComparison {
  is: Boolean
  isNot: Boolean
  eq: ID
  neq: ID
  gt: ID
  gte: ID
  lt: ID
  lte: ID
  like: ID
  notLike: ID
  iLike: ID
  notILike: ID
  in: [ID!]
  notIn: [ID!]
}

input BooleanFieldComparison {
  is: Boolean
  isNot: Boolean
}

type objectEdge {
  """The node containing the object"""
  node: object!

  """Cursor for this node."""
  cursor: ConnectionCursor!
}

type PageInfo {
  """true if paging forward and there are more records."""
  hasNextPage: Boolean

  """true if paging backwards and there are more records."""
  hasPreviousPage: Boolean

  """The cursor of the first returned record."""
  startCursor: ConnectionCursor

  """The cursor of the last returned record."""
  endCursor: ConnectionCursor
}

type ObjectConnection {
  """Paging information"""
  pageInfo: PageInfo!

  """Array of edges."""
  edges: [objectEdge!]!

  """Fetch total count of records"""
  totalCount: Int!
}

type fieldEdge {
  """The node containing the field"""
  node: field!

  """Cursor for this node."""
  cursor: ConnectionCursor!
}

type ObjectFieldsConnection {
  """Paging information"""
  pageInfo: PageInfo!

  """Array of edges."""
  edges: [fieldEdge!]!

  """Fetch total count of records"""
  totalCount: Int!
}

type WorkspaceEdge {
  """The node containing the Workspace"""
  node: Workspace!

  """Cursor for this node."""
  cursor: ConnectionCursor!
}

type UserEdge {
  """The node containing the User"""
  node: User!

  """Cursor for this node."""
  cursor: ConnectionCursor!
}

type RefreshTokenEdge {
  """The node containing the RefreshToken"""
  node: RefreshToken!

  """Cursor for this node."""
  cursor: ConnectionCursor!
}

type ValidatePasswordResetToken {
  id: String!
  email: String!
}

type AuthToken {
  token: String!
  expiresAt: DateTime!
}

type ApiKeyToken {
  token: String!
}

type AuthTokenPair {
  accessToken: AuthToken!
  refreshToken: AuthToken!
}

type AuthTokens {
  tokens: AuthTokenPair!
}

type TransientToken {
  transientToken: AuthToken!
}

type EmailPasswordResetLink {
  """Boolean that confirms query was dispatched"""
  success: Boolean!
}

type InvalidatePassword {
  """Boolean that confirms query was dispatched"""
  success: Boolean!
}

type Verify {
  tokens: AuthTokenPair!
  user: User!
}

type LoginToken {
  loginToken: AuthToken!
}

type UserExists {
  exists: Boolean!
}

type WorkspaceInviteHashValid {
  isValid: Boolean!
}

type TimelineThreadParticipant {
  personId: ID
  workspaceMemberId: ID
  firstName: String!
  lastName: String!
  displayName: String!
  avatarUrl: String!
  handle: String!
}

type TimelineThread {
  id: ID!
  read: Boolean!
  firstParticipant: TimelineThreadParticipant!
  lastTwoParticipants: [TimelineThreadParticipant!]!
  lastMessageReceivedAt: DateTime!
  lastMessageBody: String!
  subject: String!
  numberOfMessagesInThread: Float!
  participantCount: Float!
}

type AuthProviders {
  google: Boolean!
  magicLink: Boolean!
  password: Boolean!
}

type Telemetry {
  enabled: Boolean!
  anonymizationEnabled: Boolean!
}

type Billing {
  isBillingEnabled: Boolean!
  billingUrl: String!
}

type Support {
  supportDriver: String!
  supportFrontChatId: String
}

type Sentry {
  dsn: String
}

type FieldDeleteResponse {
  id: ID
  type: FieldMetadataType
  name: String
  label: String
  description: String
  icon: String
  isCustom: Boolean
  isActive: Boolean
  isSystem: Boolean
  isNullable: Boolean
  defaultValue: JSON
  options: JSON
  createdAt: DateTime
  updatedAt: DateTime
}

type FieldConnection {
  """Paging information"""
  pageInfo: PageInfo!

  """Array of edges."""
  edges: [fieldEdge!]!

  """Fetch total count of records"""
  totalCount: Int!
}

type RelationDeleteResponse {
  id: ID
  relationType: RelationMetadataType
  fromObjectMetadataId: String
  toObjectMetadataId: String
  fromFieldMetadataId: String
  toFieldMetadataId: String
  createdAt: DateTime
  updatedAt: DateTime
}

type relationEdge {
  """The node containing the relation"""
  node: relation!

  """Cursor for this node."""
  cursor: ConnectionCursor!
}

type RelationConnection {
  """Paging information"""
  pageInfo: PageInfo!

  """Array of edges."""
  edges: [relationEdge!]!

  """Fetch total count of records"""
  totalCount: Int!
}

type Query {
  currentUser: User!
  object(
    """The id of the record to find."""
    id: ID!
  ): object!
  objects(
    """Limit or page results."""
    paging: CursorPaging! = {first: 10}

    """Specify to filter the records returned."""
    filter: objectFilter! = {}
  ): ObjectConnection!
  relation(
    """The id of the record to find."""
    id: ID!
  ): relation!
  relations(
    """Limit or page results."""
    paging: CursorPaging! = {first: 10}
  ): RelationConnection!
  field(
    """The id of the record to find."""
    id: ID!
  ): field!
  fields(
    """Limit or page results."""
    paging: CursorPaging! = {first: 10}

    """Specify to filter the records returned."""
    filter: fieldFilter! = {}
  ): FieldConnection!
  checkUserExists(email: String!): UserExists!
  checkWorkspaceInviteHashIsValid(inviteHash: String!): WorkspaceInviteHashValid!
  findWorkspaceFromInviteHash(inviteHash: String!): Workspace!
  validatePasswordResetToken(passwordResetToken: String!): ValidatePasswordResetToken!
}

input objectFilter {
  and: [objectFilter!]
  or: [objectFilter!]
  id: IDFilterComparison
  isCustom: BooleanFieldComparison
  isActive: BooleanFieldComparison
  isSystem: BooleanFieldComparison
}

type Mutation {
  uploadProfilePicture(file: Upload!): String!
  deleteUser: User!
  uploadFile(file: Upload!, fileFolder: FileFolder): String!
  uploadImage(file: Upload!, fileFolder: FileFolder): String!
  deleteOneObject(input: DeleteOneObjectInput!): object!
  createOneObject(input: CreateOneObjectInput!): object!
  updateOneObject(input: UpdateOneObjectInput!): object!
  createOneRelation(input: CreateOneRelationInput!): relation!
  deleteOneRelation(input: DeleteOneRelationInput!): RelationDeleteResponse!
  createOneField(input: CreateOneFieldMetadataInput!): field!
  updateOneField(input: UpdateOneFieldMetadataInput!): field!
  deleteOneField(input: DeleteOneFieldInput!): FieldDeleteResponse!
  challenge(email: String!, password: String!): LoginToken!
  signUp(email: String!, password: String!, workspaceInviteHash: String): LoginToken!
  generateTransientToken: TransientToken!
  verify(loginToken: String!): Verify!
  renewToken(refreshToken: String!): AuthTokens!
  impersonate(userId: String!): Verify!
  generateApiKeyToken(apiKeyId: String!, expiresAt: String!): ApiKeyToken!
  emailPasswordResetLink: EmailPasswordResetLink!
  updatePasswordViaResetToken(passwordResetToken: String!, newPassword: String!): InvalidatePassword!
}

"""The \`Upload\` scalar type represents a file upload."""
scalar Upload

enum FileFolder {
  ProfilePicture
  WorkspaceLogo
  Attachment
  PersonPicture
}

input DeleteOneObjectInput {
  """The id of the record to delete."""
  id: ID!
}

input CreateOneObjectInput {
  """The record to create"""
  object: CreateObjectInput!
}

input CreateObjectInput {
  nameSingular: String!
  namePlural: String!
  labelSingular: String!
  labelPlural: String!
  description: String
  icon: String
  labelIdentifierFieldMetadataId: String
  imageIdentifierFieldMetadataId: String
}

input UpdateOneObjectInput {
  """The id of the record to update"""
  id: ID!

  """The update to apply."""
  update: UpdateObjectInput!
}

input UpdateObjectInput {
  labelSingular: String
  labelPlural: String
  nameSingular: String
  namePlural: String
  description: String
  icon: String
  isActive: Boolean
  labelIdentifierFieldMetadataId: String
  imageIdentifierFieldMetadataId: String
}

input CreateOneRelationInput {
  """The record to create"""
  relation: CreateRelationInput!
}

input CreateRelationInput {
  relationType: RelationMetadataType!
  fromObjectMetadataId: String!
  toObjectMetadataId: String!
  fromName: String!
  toName: String!
  fromLabel: String!
  toLabel: String!
  fromIcon: String
  toIcon: String
  description: String
  fromDescription: String
  toDescription: String
}

input DeleteOneRelationInput {
  """The id of the record to delete."""
  id: ID!
}

input CreateOneFieldMetadataInput {
  """The record to create"""
  field: CreateFieldInput!
}

input CreateFieldInput {
  type: FieldMetadataType!
  name: String!
  label: String!
  description: String
  icon: String
  isCustom: Boolean
  isActive: Boolean
  isSystem: Boolean
  isNullable: Boolean
  defaultValue: JSON
  options: JSON
  objectMetadataId: String!
}

input UpdateOneFieldMetadataInput {
  """The id of the record to update"""
  id: ID!

  """The record to update"""
  update: UpdateFieldInput!
}

input UpdateFieldInput {
  name: String
  label: String
  description: String
  icon: String
  isCustom: Boolean
  isActive: Boolean
  isSystem: Boolean
  isNullable: Boolean
  defaultValue: JSON
  options: JSON
}

input DeleteOneFieldInput {
  """The id of the record to delete."""
  id: ID!
}
`,
  ],
});
