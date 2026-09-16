# Retrieve Workspace Data

## Overview

Retrieve the Twenty records needed to answer the user's question, then present them as a useful answer, not as raw API output. Always translate technical fields, timestamps, IDs, and nested structures into readable summaries that help the user scan, compare, and act.

## Retrieval Workflow

Resolve the intended workspace before selecting a Twenty MCP server:

- If the user names a workspace, host, MCP server, or URL, use only the matching Twenty MCP namespace or server.
- If multiple Twenty MCP namespaces or configured servers are available and the intended workspace is ambiguous, ask one concise clarifying question before retrieving data.
- If exactly one Twenty MCP namespace is available and the user did not specify a workspace, use it and mention which workspace or server was used when reporting results.
- If a configured server exists but the matching MCP tools are not visible in the current thread, use the MCP setup troubleshooting workflow in `setup.md` instead of falling back to a different workspace.
- Before querying workspace data, confirm the callable Twenty MCP namespace or server name corresponds to the intended workspace whenever there is any ambiguity.

Use the selected connected Twenty MCP server when it is available:

```text
learn_tools -> execute_tool
```

- Discover object, field, filter, and sort names before querying.
- Retrieve only answer, ordering, and disambiguation fields.
- For "latest", "most recent", or "recent" requests, show the timestamp used for sorting.
- Limit broad lists and state how many records are shown.
- Ask one clarifying question only when tools cannot supply required context.
- If no Twenty MCP tools are available, use the setup workflow in `setup.md`; do not invent workspace data.

## Workspace Origin

Record links need a workspace origin, such as `https://example.twenty.com` or `http://workspace.localhost:3001`.

- If the user provides the workspace URL, use that origin after removing any trailing `/mcp`.
- If the selected MCP server URL is visible, derive the origin from it by removing the trailing `/mcp`.
- If the selected MCP server is configured locally but the URL is not in context, inspect that exact server configuration before formatting linked records.
- If the origin is still unknown, do not invent a hostname. Explain that direct record links need the workspace URL.

## Response Shape

Start with the answer or count, then show the records in the clearest compact shape:

- For one record, use a short labelled summary.
- For two to ten comparable records, use a Markdown table.
- For larger sets, show the most relevant rows first, mention the total, and offer the next useful filter or page only when needed.
- For nested records, summarize the important nested values instead of dumping JSON.
- When comparing records across workspaces, prefer one combined table with a `Workspace` column if it improves scanning. Use separate sections only when each workspace needs different columns.

Use English labels and prose. Keep user-provided names, record values, emails, URLs, and proper nouns unchanged.

## Record Links

Link records back to their original Twenty context whenever the workspace origin and record identity are known.

- Build record links with the Twenty show-page path: `/object/:objectNameSingular/:objectRecordId`.
- For absolute links, combine the workspace origin with that path: `{workspaceOrigin}/object/{objectNameSingular}/{recordId}`.
- Preserve the workspace scheme and port for local workspaces, for example `http://workspace.localhost:3001/object/person/record-id`.
- Use `recordReferences` from MCP responses when available to get `objectNameSingular`, `recordId`, and `displayName`.
- If `recordReferences` is missing, use the record's `id` and the object name from the tool that returned it.
- If `recordReferences` and workspace origin are both available, the first record-name column or record heading MUST link the display name. Do not output unlinked record names in that case.
- Prefer linking the record display name in tables and summaries instead of adding a raw ID column.
- When showing records from multiple workspaces, generate links with each record's own workspace origin.
- If the workspace origin is unknown, do not invent a hostname. Add a compact `Record` column with the object name and record ID, or say that direct links need the workspace URL.

## Visual Identifiers

Add a small visual identifier next to records when it improves scanning and the source data provides one.

- Twenty AI chat currently renders Markdown with `react-markdown` and `remark-gfm`, without raw HTML rendering. Do not rely on HTML such as `<img width="16" height="16">`.
- Use standard Markdown image syntax only: `![alt](image-url)`.
- The current Twenty AI chat image CSS preserves intrinsic image size with `height: auto` and only caps `max-width`. Do not place full-size photos or large avatars in tables unless the image URL is already a small thumbnail.
- Prefer the record's own `avatarUrl`, logo, or image field when present and non-empty.
- For People, show the person's avatar or profile image only when the URL is known to be a small thumbnail. If there is no suitable image, keep the linked name and do not generate fake headshots.
- For Companies, Workspaces, domains, or records mainly identified by an email/domain, prefer a small favicon or logo when the record provides a safe public website, domain, or avatar URL.
- Derive a domain from `emails.primaryEmail`, `website`, `domainName`, or equivalent fields only for display or favicon lookup; never expose private internal domains as external image requests.
- If image sizing is not reliable, use a text `Domain`, `Company`, or `Source` column instead of an image.
- Always include readable text next to the image. Never make an image the only record label.
- If no trustworthy image or favicon source is available, omit the image instead of showing a broken placeholder.
- Avoid adding images to very large result sets unless the user asks for a visual scan.
- Avoid stacking multiple visual tokens before a record name, such as favicon plus emoji plus linked text. Redundant icons make table alignment harder to scan.

## Dates And Times

Never expose ISO/RFC3339 timestamps as the main date display.

- Parse common technical formats such as `2026-05-05T09:43:18.123Z`, `2026-05-05T09:43:18+02:00`, Unix seconds, and Unix milliseconds.
- Convert instants with `Z` or an explicit offset to the user's timezone when known. If timezone is unknown, keep the source timezone or ask only when it changes the meaning.
- Preserve date-only values as dates. Do not shift date-only values across timezones.
- Display absolute dates. Use relative words such as "today", "yesterday", or "last week" only as a supplement when helpful.
- Include the year unless it is truly redundant in a small same-year table.
- Show seconds and milliseconds only when they matter for debugging, audit logs, or ordering events with near-identical times.

Examples:

- Timestamp: `2026-05-05T09:43:18.123Z` -> `May 5, 2026, 11:43 AM`
- Date-only value: `2026-05-05` -> `May 5, 2026`

If the exact raw timestamp is relevant, put it after the readable value:

```text
Created: May 5, 2026, 11:43 AM (raw: 2026-05-05T09:43:18.123Z)
```

## Field Labels

Convert raw field names into user-facing labels:

- `createdAt` -> `Created`
- `updatedAt` -> `Last updated`
- `deletedAt` -> `Deleted`
- `createdBy` -> `Created by`
- `workspaceMemberId` -> `Workspace member`
- `opportunityStage` -> `Opportunity stage`

Prefer the label users see in Twenty when it is available from metadata. Otherwise, split camelCase, snake_case, and kebab-case into normal words.

## Value Formatting

Format values by meaning:

- Empty or null: `Not set`, or omit if the field is irrelevant.
- Booleans: `Yes` / `No`.
- Money: include currency and grouping, for example `EUR 12,450` or `USD 12,450` based on the record currency.
- Percentages: use `%`, round only enough to stay meaningful.
- URLs and emails: make them clickable Markdown links when useful.
- IDs and UUIDs: hide by default unless the user asks for identifiers, deduplication, debugging, or exact references.
- Arrays: show the count and the most important names, not the full serialized array.

## Record Ordering

When the user asks for "latest", "recent", or "last records":

- State which date field was used when it is not obvious, for example `sorted by Last updated`.
- Prefer `updatedAt` for "recent activity" and `createdAt` for "newest records" unless the user's wording or object semantics points to another date.
- Display the chosen date column in readable form.
- If multiple records share the same date, keep a deterministic secondary order such as name or ID.

## Table Alignment

Make tables easy to scan before making them visually decorative.

- Use Markdown alignment markers intentionally: text columns left-aligned (`:---`), numeric money/count columns right-aligned (`---:`), and short status columns centered only when that actually improves scanning (`:---:`).
- Keep record names on a stable left edge. If rows have favicons, avatars, or logos, prefer a dedicated narrow `Icon`, `Logo`, or `Avatar` column followed by a linked record-name column.
- If the table is compact and the image is known to be consistently small, it is acceptable to put `![alt](url) [Name](record-url)` in one cell. Do not also add emoji or extra symbols before the name.
- Keep fixed-format fields such as `Created`, `Updated`, `Amount`, and `Source` to the right of variable-width fields such as `Name`, `Company`, `Person`, and `Domain`.
- Use a consistent date format within a table so rows line up visually, for example `May 5, 2026, 11:43 AM` or `May 5, 11:43`.
- Prefer natural links over extra link columns: link the record name to Twenty, and link the domain or email only when that external destination is useful.
- Avoid raw ID columns in normal user-facing tables. IDs are long, visually dominant, and destroy alignment unless the user asks for them.

## Markdown Patterns

Use a compact table for comparable records:

```markdown
I found 5 recent opportunities, sorted by last updated date.

| Logo | Name | Stage | Amount | Last updated |
| :---: | :--- | :--- | ---: | :--- |
| ![Acme icon](https://example.com/favicon.ico) | [Acme renewal](https://example.twenty.com/object/opportunity/record-id-1) | Negotiation | EUR 12,450 | May 5, 2026, 11:43 AM |
| ![Globex icon](https://globex.example/favicon.ico) | [Globex expansion](https://example.twenty.com/object/opportunity/record-id-2) | Discovery | EUR 8,000 | May 4, 2026, 4:10 PM |
```

For recent companies with `recordReferences`, link the company name:

```markdown
I found 5 recent companies, sorted by Created.

| Company | Domain | Created |
| :--- | :--- | :--- |
| [Acme](https://workspace.example/object/company/00000000-0000-0000-0000-000000000001) | [acme.example](https://acme.example) | May 5, 2026, 11:43 AM |
```

Use a labelled block for one important record:

```markdown
**[Acme renewal](https://example.twenty.com/object/opportunity/record-id-1)**

- Stage: Negotiation
- Amount: EUR 12,450
- Next action: Not set
- Last updated: May 5, 2026, 11:43 AM
```

## Raw Data Exceptions

Show raw JSON, raw timestamps, internal IDs, or full nested objects only when the user asks for debugging, export, exact API payloads, schema inspection, or reproducible commands. Even then, put a readable summary before the raw block.
