What does this mean? And what does `WorkspaceMember` look like?

```prisma
model User {
  /// @TypeGraphQL.omit(input: true)
  workspaceMember WorkspaceMember?
}
```