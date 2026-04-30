# Knowledge Base

Self-service knowledge base with hierarchical categories, article management, search, and versioning.

## Entities
- `KBCategoryEntity` — name, description, parentCategoryId, icon, sortOrder
- `KBArticleEntity` — title, content, summary, status (draft/published/archived), categoryId, tags, author, view/helpfulness metrics

## Service Methods
- `KnowledgeBaseService` — creates categories and articles, publishes/archives articles, tracks views and helpfulness ratings, supports full-text search

## Feature Flag
`IS_MODULE_KNOWLEDGE_BASE_ENABLED`

## Dependencies
- None
