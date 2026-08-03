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
| [Data Model](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=43908-119132) | `IconHierarchy` | `hierarchy` | Representing the data model or schema as a whole. | Representing one object, one field, or an organization chart. | schema, data model, objects and fields |
| [Object](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=43908-39904) | `IconBox` | `box` | Representing an individual data-model object. | Representing a record instance or the complete data model. | object metadata, entity, data object |
| [Field](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=43908-39909) | `IconListDetails` | `list-details` | Representing a field or field metadata. | Representing a list of records or a generic menu. | field metadata, property, attribute, column |
| [Record](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=43908-39917) | `IconAddressBook` | `address-book` | Representing a record or record-oriented content. | Representing the object definition that records belong to. | record, record instance, CRM entry |

## Views

| Concept | React component | Tabler name | Use when | Avoid when | Search keywords |
| --- | --- | --- | --- | --- | --- |
| [View](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=48004-126597) | `IconTable` | `table` | Representing a view without a more specific view type. | Representing dashboards, widgets, or page layouts. | view, saved view, record view |
| [Table view](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=43908-119166) | `IconTable` | `table` | Representing the table or grid view type. | Representing a Kanban view or a generic data-model field. | table view, grid view, rows and columns |
| [Kanban view](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=43908-119172) | `IconLayoutKanban` | `layout-kanban` | Representing the Kanban or board view type. | Representing a dashboard or a generic page layout. | kanban, board view, columns |
| [Group By](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=43908-119123) | `IconLayoutList` | `layout-list` | Representing grouping records by a field. | Representing sorting or a generic list layout. | group by, grouping, grouped records |
| [Filter](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=43908-119182) | `IconFilter` | `filter` | Representing filters or filter criteria. | Representing search, sorting, or workflow conditions. | filter, criteria, conditions |
| [Sort](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=43908-119187) | `IconArrowsSort` | `arrows-sort` | Representing sorting without a fixed direction. | Representing filtering or a known ascending-only direction. | sort, ordering, ascending and descending |

## Layouts

| Concept | React component | Tabler name | Use when | Avoid when | Search keywords |
| --- | --- | --- | --- | --- | --- |
| [Layout](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=93482-153590) | `IconLayout` | `layout` | Representing layouts as a general concept. | Representing a specific layout page, widget, or dashboard. | layout, page structure, arrangement |
| [Layout page](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=93482-168139) | `IconPerspective` | `perspective` | Representing a configurable page inside a layout. | Representing the broader layout system or a record page. | layout page, page canvas, page configuration |
| [Widget](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=93482-153596) | `IconLayoutGridAdd` | `layout-grid-add` | Representing a widget or the act of adding a widget. | Representing a complete dashboard or generic application. | widget, add widget, dashboard block |
| [Record Page](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=54474-209699) | `IconAddressBook` | `address-book` | Representing a page dedicated to one record. | Representing a generic layout page or object definition. | record page, record layout, record detail |
| [Command Menu Item](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=93482-168122) | `IconCommand` | `command` | Representing an item or action in the command menu. | Representing a navigation item or keyboard shortcut alone. | command menu, command item, keyboard command |
| [Navigation menu item](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=104730-253174) | `IconCompass` | `compass` | Representing a destination in a navigation menu. | Representing the navigation sidebar container itself. | navigation item, menu destination, navigation menu |
| [Dashboard](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=93482-168117) | `IconLayoutDashboard` | `layout-dashboard` | Representing a dashboard or dashboard page. | Representing an individual widget or a Kanban board. | dashboard, analytics page, dashboard layout |

## Logic

| Concept | React component | Tabler name | Use when | Avoid when | Search keywords |
| --- | --- | --- | --- | --- | --- |
| [Logic](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=93482-168147) | `IconSettingsAutomation` | `settings-automation` | Representing automation logic as a general concept. | Representing a tool, skill, or serverless function. | logic, automation, business logic |
| [Workflows](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=93482-153606) | `IconSettingsAutomation` | `settings-automation` | Representing workflows or the workflow system. | Representing one workflow action or an AI tool. | workflow, automation flow, workflow builder |
| [Tools (AI + Workflows)](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=93482-153612) | `IconTool` | `tool` | Representing tools available to AI agents or workflows. | Representing application settings or developer skills. | tool, AI tool, workflow tool, callable capability |
| [Skill](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=93482-168106) | `IconBook` | `book` | Representing an AI skill or reusable instruction set. | Representing documentation in general or an executable tool. | skill, agent instructions, knowledge guide |
| [Serverless functions](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=93482-153617) | `IconBrandTypescript` | `brand-typescript` | Representing Twenty serverless or logic functions. | Representing generic source code or non-TypeScript tools. | serverless function, logic function, TypeScript function |

## General

| Concept | React component | Tabler name | Use when | Avoid when | Search keywords |
| --- | --- | --- | --- | --- | --- |
| [App](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=93482-168129) | `IconApps` | `apps` | Representing an application or the apps platform. | Representing a widget, integration, or one navigation item. | app, application, Twenty app |
| [MCP](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=106914-121731) | `IconSparkles` | `sparkles` | Representing MCP integrations, servers, or capabilities. | Representing AI agents or generic decorative emphasis. | MCP, Model Context Protocol, AI connection |
| [Navigation Sidebar](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=88235-230438) | `IconLayoutSidebar` | `layout-sidebar` | Representing the application navigation sidebar. | Representing a destination inside the navigation menu. | navigation sidebar, sidebar, left navigation |
| [Iframe](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=94827-199226) | `IconFrame` | `frame` | Representing an iframe or embedded external page. | Representing a native page layout or browser window. | iframe, embedded page, web frame |
| [Agents](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=94916-287570) | `IconLego` | `lego` | Representing AI agents or the agents platform. | Representing MCP, tools, or generic automation logic. | agent, AI agent, agent configuration |

## Updating the dictionary

1. Update the typed manifest in `constants/TwentyIconDictionary.ts`.
2. Confirm the visual choice in the linked Figma dictionary.
3. Run `npx nx generateIconDictionary twenty-ui`.
4. Review the `UI/Icon/Icon Dictionary` Storybook story.
5. Run `npx jest packages/twenty-ui/src/icon/__tests__/TwentyIconDictionary.test.ts --config=packages/twenty-ui/jest.config.mjs`.
