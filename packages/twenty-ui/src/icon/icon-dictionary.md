# Twenty Icon Dictionary

<!-- This file is generated. Edit constants/TwentyIconDictionary.ts, then run: npx nx generateIconDictionary twenty-ui -->

This is the canonical engineering reference for icons that represent Twenty product concepts. The [Figma dictionary](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=43908-39914) is the visual reference; the typed manifest in [`constants/TwentyIconDictionary.ts`](./constants/TwentyIconDictionary.ts) is the code source of truth.

## Selection rules

1. When a UI element represents one of the concepts below, use its canonical icon.
2. Use action icons such as `IconPlus`, `IconEdit`, or `IconTrash` when the element represents an action rather than a product concept.
3. Use status icons for statuses and feedback. Do not replace them with a nearby dictionary concept.
4. Import icons from `twenty-ui/icon`. Do not import directly from `@tabler/icons-react`.
5. If no concept matches, choose an existing icon from `twenty-ui/icon` and do not add a new icon package.

## Usage

```tsx
import { IconHierarchy } from 'twenty-ui/icon';
```

## Data Model

| Concept | React component | Tabler name | Use when | Avoid when | Search keywords |
| --- | --- | --- | --- | --- | --- |
| Data Model | `IconHierarchy` | `hierarchy` | Representing the data model or schema as a whole. | Representing one object, one field, or an organization chart. | schema, data model, objects and fields |
| Object | `IconBox` | `box` | Representing an individual data-model object. | Representing a record instance or the complete data model. | object metadata, entity, data object |
| Field | `IconListDetails` | `list-details` | Representing a field or field metadata. | Representing a list of records or a generic menu. | field metadata, property, attribute, column |
| Record | `IconAddressBook` | `address-book` | Representing a record or record-oriented content. | Representing the object definition that records belong to. | record, record instance, CRM entry |

## CRM

| Concept | React component | Tabler name | Use when | Avoid when | Search keywords |
| --- | --- | --- | --- | --- | --- |
| Person | `IconUser` | `user` | Representing a person or individual CRM contact. | Representing a workspace member, team, or user action. | person, contact, individual, people record |
| Company | `IconBuildingSkyscraper` | `building-skyscraper` | Representing a company or organization CRM record. | Representing the current workspace or a generic office. | company, account, organization, business |
| Opportunity | `IconTargetArrow` | `target-arrow` | Representing a sales opportunity or deal. | Representing a generic goal, target, or navigation action. | opportunity, deal, pipeline, sales |
| Task | `IconCheckbox` | `checkbox` | Representing a task, to-do, or follow-up record. | Representing a boolean field or completed status alone. | task, to-do, action item, follow-up |
| Note | `IconNotes` | `notes` | Representing a note attached to CRM content. | Representing documentation, comments, or chat messages. | note, memo, record note, written note |

## Views

| Concept | React component | Tabler name | Use when | Avoid when | Search keywords |
| --- | --- | --- | --- | --- | --- |
| View | `IconTable` | `table` | Representing a view without a more specific view type. | Representing dashboards, widgets, or page layouts. | view, saved view, record view |
| Table view | `IconTable` | `table` | Representing the table or grid view type. | Representing a Kanban view or a generic data-model field. | table view, grid view, rows and columns |
| Kanban view | `IconLayoutKanban` | `layout-kanban` | Representing the Kanban or board view type. | Representing a dashboard or a generic page layout. | kanban, board view, columns |
| Group By | `IconLayoutList` | `layout-list` | Representing grouping records by a field. | Representing sorting or a generic list layout. | group by, grouping, grouped records |
| Filter | `IconFilter` | `filter` | Representing filters or filter criteria. | Representing search, sorting, or workflow conditions. | filter, criteria, conditions |
| Sort | `IconArrowsSort` | `arrows-sort` | Representing sorting without a fixed direction. | Representing filtering or a known ascending-only direction. | sort, ordering, ascending and descending |

## Layouts

| Concept | React component | Tabler name | Use when | Avoid when | Search keywords |
| --- | --- | --- | --- | --- | --- |
| Layout | `IconAppWindow` | `app-window` | Representing layouts as a general concept. | Representing a specific layout page, widget, or dashboard. | layout, page structure, arrangement |
| Layout page | `IconPerspective` | `perspective` | Representing a configurable page inside a layout. | Representing the broader layout system or a record page. | layout page, page canvas, page configuration |
| Widget | `IconLayoutGridAdd` | `layout-grid-add` | Representing a widget or the act of adding a widget. | Representing a complete dashboard or generic application. | widget, add widget, dashboard block |
| Record Page | `IconAddressBook` | `address-book` | Representing a page dedicated to one record. | Representing a generic layout page or object definition. | record page, record layout, record detail |
| Side Panel | `IconLayoutSidebarRight` | `layout-sidebar-right` | Representing a side panel that shows contextual content alongside a page. | Representing the main navigation sidebar, a modal, or an open or close panel action. | side panel, right panel, context panel, drawer |
| Command Menu Item | `IconCommand` | `command` | Representing an item or action in the command menu. | Representing a navigation item or keyboard shortcut alone. | command menu, command item, keyboard command |
| Navigation menu item | `IconCompass` | `compass` | Representing a destination in a navigation menu. | Representing the navigation sidebar container itself. | navigation item, menu destination, navigation menu |
| Dashboard | `IconLayoutDashboard` | `layout-dashboard` | Representing a dashboard or dashboard page. | Representing an individual widget or a Kanban board. | dashboard, analytics page, dashboard layout |

## Workspace and Access

| Concept | React component | Tabler name | Use when | Avoid when | Search keywords |
| --- | --- | --- | --- | --- | --- |
| Workspace | `IconSettings` | `settings` | Representing the current workspace or its configuration. | Representing a generic settings action or a CRM company. | workspace, tenant, workspace settings, organization |
| Member / Team | `IconUsers` | `users` | Representing workspace members, teams, or assignments. | Representing an individual CRM person or an invite action. | member, team, workspace user, assignee |
| Role | `IconLock` | `lock` | Representing a role or its permission configuration. | Representing a locked state, security alert, or authentication. | role, permissions, access role, authorization |
| Permissions | `IconLock` | `lock` | Representing permissions or permission configuration. | Representing a role, locked state, or security credentials. | permissions, access control, authorization, privileges |
| Billing | `IconCreditCard` | `credit-card` | Representing billing, subscriptions, or payment settings. | Representing a currency field, price, or monetary amount. | billing, subscription, payment method, invoice |
| Security | `IconKey` | `key` | Representing security settings, credentials, or access controls. | Representing a role, one permission, or an authentication state. | security, credentials, access, secrets |
| Audit Logs | `IconHistory` | `history` | Representing audit, event, or workspace history logs. | Representing runtime output or execution logs. | audit logs, event logs, history, activity history |

## Logic

| Concept | React component | Tabler name | Use when | Avoid when | Search keywords |
| --- | --- | --- | --- | --- | --- |
| Logic | `IconSettingsAutomation` | `settings-automation` | Representing automation logic as a general concept. | Representing a tool, skill, or serverless function. | logic, automation, business logic |
| Workflows | `IconSettingsAutomation` | `settings-automation` | Representing workflows or the workflow system. | Representing one workflow action or an AI tool. | workflow, automation flow, workflow builder |
| Tools (AI + Workflows) | `IconTool` | `tool` | Representing tools available to AI agents or workflows. | Representing application settings or developer skills. | tool, AI tool, workflow tool, callable capability |
| Skill | `IconBook` | `book` | Representing an AI skill or reusable instruction set. | Representing documentation in general or an executable tool. | skill, agent instructions, knowledge guide |
| Serverless functions | `IconBrandTypescript` | `brand-typescript` | Representing Twenty serverless or logic functions. | Representing generic source code or non-TypeScript tools. | serverless function, logic function, TypeScript function |
| Execution Logs | `IconTerminal` | `terminal` | Representing runtime output from workflows, agents, or code. | Representing audit trails, event history, or source code. | execution logs, runtime logs, workflow logs, agent logs |

## AI

| Concept | React component | Tabler name | Use when | Avoid when | Search keywords |
| --- | --- | --- | --- | --- | --- |
| AI Model | `IconCpu` | `cpu` | Representing an AI model or model configuration. | Representing reasoning state, an AI agent, or computer hardware. | AI model, language model, LLM, model selection |
| AI / Ask AI | `IconSparkles` | `sparkles` | Representing generic AI features or the Ask AI experience. | Representing an AI model, agent, prompt, or MCP connection. | AI, Ask AI, assistant, generative AI |
| Prompt | `IconPrompt` | `prompt` | Representing AI prompts or prompt configuration. | Representing a command menu, terminal, or AI conversation. | prompt, system prompt, instructions, prompt configuration |
| Conversation / Chat | `IconMessage` | `message` | Representing an AI conversation or chat thread. | Representing email, notes, comments, or communication settings. | conversation, chat, thread, AI message |

## Platform

| Concept | React component | Tabler name | Use when | Avoid when | Search keywords |
| --- | --- | --- | --- | --- | --- |
| API | `IconApi` | `api` | Representing APIs, API access, or API configuration. | Representing MCP, webhooks, or external-service integrations. | API, REST, GraphQL, API key |
| MCP & APIs | `IconPlug` | `plug` | Representing the combined MCP, API keys, and webhooks settings area. | Representing an API, MCP server, webhook, or integration individually. | MCP and APIs, developer connections, API keys and webhooks, platform connections |
| API Key | `IconKey` | `key` | Representing an API key or API credential. | Representing APIs generally, security settings, or permissions. | API key, API credential, access token, secret key |
| Webhook | `IconWebhook` | `webhook` | Representing webhooks, webhook endpoints, or webhook events. | Representing a generic API, integration, or workflow action. | webhook, event callback, HTTP event, webhook endpoint |
| Integration / Connection | `IconPlug` | `plug` | Representing an integration or connection to an external service. | Representing an app, API, MCP, or connected email account. | integration, connection, external service, provider |
| Connected Account | `IconAt` | `at` | Representing a connected email or calendar account. | Representing a generic integration, user account, or email field. | connected account, email sync, calendar sync, mailbox |
| Marketplace | `IconShoppingBag` | `shopping-bag` | Representing the app marketplace or marketplace catalog. | Representing an installed app or the action of installing one. | marketplace, app catalog, browse apps, marketplace apps |
| Application Version | `IconVersions` | `versions` | Representing application version information. | Representing a Git branch, deployment status, or update action. | application version, app version, latest version, version |
| MCP | `IconSparkles` | `sparkles` | Representing MCP integrations, servers, or capabilities. | Representing generic AI features, APIs, or non-MCP integrations. | MCP, Model Context Protocol, AI connection |
| Admin Panel | `IconServer` | `server` | Representing the Twenty admin panel or instance-level administration. | Representing infrastructure health, server status, or workspace settings. | admin panel, instance administration, system administration, admin settings |

## General

| Concept | React component | Tabler name | Use when | Avoid when | Search keywords |
| --- | --- | --- | --- | --- | --- |
| Notification | `IconBell` | `bell` | Representing notifications or notification settings. | Representing an error severity, favorite, or decorative star. | notification, notice, notification settings, alert |
| Files | `IconFiles` | `files` | Representing a collection of files or a files section. | Representing one file, an attachment, or an upload action. | files, file collection, documents, file section |
| Attachments | `IconPaperclip` | `paperclip` | Representing attachments or an attachment relationship. | Representing a general file collection, import, or upload action. | attachment, attachments, attached file, record attachment |
| App | `IconApps` | `apps` | Representing an application or the apps platform. | Representing a widget, integration, or one navigation item. | app, application, Twenty app |
| Navigation Sidebar | `IconLayoutSidebar` | `layout-sidebar` | Representing the application navigation sidebar. | Representing a destination inside the navigation menu. | navigation sidebar, sidebar, left navigation |
| Iframe | `IconFrame` | `frame` | Representing an iframe or embedded external page. | Representing a native page layout or browser window. | iframe, embedded page, web frame |
| Agents | `IconLego` | `lego` | Representing AI agents or the agents platform. | Representing MCP, tools, or generic automation logic. | agent, AI agent, agent configuration |

## Updating the dictionary

1. Update the typed manifest in `constants/TwentyIconDictionary.ts`.
2. Confirm the visual choice in the linked Figma dictionary.
3. Run `npx nx generateIconDictionary twenty-ui`.
4. Review the `UI/Icon/Icon Dictionary` Storybook story.
5. Run `npx jest packages/twenty-ui/src/icon/__tests__/TwentyIconDictionary.test.ts --config=packages/twenty-ui/jest.config.mjs`.
