import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import { type ReleaseNote } from './release-note';

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    release: '2.0.0',
    date: '2026-04-21',
    highlights: [
      {
        title: msg`Build an app`,
        description: (
          <Trans>
            Model your data, add business logic, and design layouts — everything
            you need to ship an app on top of Twenty, in one place.
          </Trans>
        ),
        image: '/images/releases/2.0/2.0.0-build-anything.webp',
      },
      {
        title: msg`Version control`,
        description: (
          <Trans>
            Your workspace is backed by a git repo, so you can branch, review in
            pull requests, and roll back changes the same way you ship code.
          </Trans>
        ),
        image: '/images/releases/2.0/2.0.0-version-control.webp',
      },
      {
        title: msg`Build with your favorite tools`,
        description: (
          <Trans>
            Scaffold components, workflows, and skills directly from Claude
            Code, Cursor, or the CLI, and commit them back to your workspace.
          </Trans>
        ),
        image: '/images/releases/2.0/2.0.0-build-with-tools.webp',
      },
      {
        title: msg`Custom layouts`,
        description: (
          <Trans>
            Drag and drop widgets to build record pages, dashboards, and layout
            pages that match the way your team actually works.
          </Trans>
        ),
        image: '/images/releases/2.0/2.0.0-custom-layouts.webp',
      },
      {
        title: msg`AI agents, chats, and MCP`,
        description: (
          <Trans>
            Pick your model, build agents that write emails or enrich records
            inside workflows, and expose your workspace to any MCP-compatible
            client.
          </Trans>
        ),
        image: '/images/releases/2.0/2.0.0-ai.webp',
      },
    ],
  },
  {
    release: '1.23.0',
    date: '2026-04-17',
    highlights: [
      {
        title: msg`Easier layouts`,
        description: (
          <Trans>
            Reset layouts to default, pick tab icons, and connect shortcuts to
            specific page layouts.
          </Trans>
        ),
        image: '/images/releases/1.23/1.23.0-easier-layouts.webp',
      },
      {
        title: msg`Faster field setup`,
        description: (
          <Trans>
            Search in field pickers and add-column menus makes table and layout
            customization faster.
          </Trans>
        ),
      },
    ],
  },
  {
    release: '1.22.0',
    date: '2026-04-11',
    highlights: [
      {
        title: msg`Rich text layouts`,
        description: (
          <Trans>
            Add rich text directly inside layouts with the new dedicated field
            widget.
          </Trans>
        ),
        image: '/images/releases/1.22/1.22.0-rich-text-layouts.webp',
      },
      {
        title: msg`More field relations`,
        description: (
          <Trans>
            Field widgets now support more relation types, so custom layouts
            work better across more objects.
          </Trans>
        ),
      },
    ],
  },
  {
    release: '1.21.0',
    date: '2026-04-09',
    highlights: [
      {
        title: msg`Email replies`,
        description: (
          <Trans>
            Email thread widgets and an inline reply composer make it easier to
            work directly from messaging records.
          </Trans>
        ),
        image: '/images/releases/1.21/1.21.0-email-replies.webp',
      },
      {
        title: msg`Maintenance mode`,
        description: (
          <Trans>
            A new maintenance mode helps admins pause workspace changes during
            sensitive operations.
          </Trans>
        ),
        image: '/images/releases/1.21/1.21.0-maintenance-mode.webp',
      },
    ],
  },
  {
    release: '1.20.0',
    date: '2026-03-31',
    highlights: [
      {
        title: msg`Easier field editing`,
        description: (
          <Trans>
            Create fields and edit field widgets more directly from record
            pages.
          </Trans>
        ),
        image: '/images/releases/1.20/1.20.0-easier-field-editing.webp',
      },
      {
        title: msg`Field widgets`,
        description: (
          <Trans>
            Field widgets are easier to configure directly from the page where
            you use them.
          </Trans>
        ),
        image: '/images/releases/1.20/1.20.0-field-widgets.webp',
      },
    ],
  },
  {
    release: '1.19.0',
    date: '2026-03-12',
    highlights: [
      {
        title: msg`Self-hosted billing`,
        description: (
          <Trans>
            Self-hosted workspaces can now track usage more cleanly with
            usage-based billing support.
          </Trans>
        ),
      },
      {
        title: msg`Invite roles`,
        description: (
          <Trans>
            Choose a role directly when inviting a teammate to a workspace.
          </Trans>
        ),
        image: '/images/releases/1.19/1.19.0-invite-roles.webp',
      },
    ],
  },
  {
    release: '1.18.0',
    date: '2026-02-18',
    highlights: [
      {
        title: msg`Sidebar items`,
        description: (
          <Trans>
            Create and organize sidebar items more easily with a cleaner
            navigation setup.
          </Trans>
        ),
        image: '/images/releases/1.18/1.18.0-sidebar-items.webp',
      },
      {
        title: msg`Live updates`,
        description: (
          <Trans>
            Some teammate changes now appear right away, so collaboration feels
            faster and more up to date.
          </Trans>
        ),
        image: '/images/releases/1.18/1.18.0-live-updates.webp',
      },
    ],
  },
  {
    release: '1.17.0',
    date: '2026-02-10',
    highlights: [
      {
        title: msg`AI chat`,
        description: (
          <Trans>
            AI Chat is easier to use with a cleaner experience and clearer model
            choices.
          </Trans>
        ),
        image: '/images/releases/1.17/1.17.0-ai-chat.webp',
      },
      {
        title: msg`Custom sidebar`,
        description: (
          <Trans>
            Favorites now live in the navigation menu, making the sidebar easier
            to organize and customize.
          </Trans>
        ),
      },
    ],
  },
  {
    release: '1.16.0',
    date: '2026-01-23',
    highlights: [
      {
        title: msg`Files in records`,
        description: (
          <Trans>
            Add files directly to records so documents, screenshots, and other
            assets stay attached to the right work.
          </Trans>
        ),
        image: '/images/releases/1.16/1.16.0-files-in-records.webp',
      },
      {
        title: msg`Flexible relations`,
        description: (
          <Trans>
            Create more flexible relationships between objects, including more
            advanced many-to-many setups.
          </Trans>
        ),
        image: '/images/releases/1.16/1.16.0-flexible-relations.webp',
      },
    ],
  },
  {
    release: '1.15.0',
    date: '2026-01-08',
    highlights: [
      {
        title: msg`Updated by`,
        description: <Trans>You can now see who last updated a record</Trans>,
        image: '/images/releases/1.15/1.15.0-updated-by-official.webp',
      },
    ],
  },
  {
    release: '1.14.0',
    date: '2025-12-20',
    highlights: [
      {
        title: msg`Resize navbar and side panel`,
        description: (
          <Trans>
            You can now resize the side panel and navigation menu to view
            content more easily. This is especially useful on record pages with
            long content.
          </Trans>
        ),
        image: '/images/releases/1.14/1.14.0-resize-navbar-and-side-panel.webp',
      },
    ],
  },
  {
    release: '1.13.0',
    date: '2025-12-17',
    highlights: [
      {
        title: msg`Stop Workflow Button`,
        description: (
          <Trans>
            Take control of your running workflows with the new Stop Workflow
            button. When a workflow is in progress, you can now immediately halt
            its execution, giving you the flexibility to cancel operations that
            are no longer needed or troubleshoot issues in real-time.
          </Trans>
        ),
        image: '/images/releases/1.13/1.13.0-stop-workflow-button.webp',
      },
    ],
  },
  {
    release: '1.12.0',
    date: '2025-12-02',
    highlights: [
      {
        title: msg`Revamped Side Panel`,
        description: (
          <Trans>
            The side panel now opens next to your content rather than above it,
            giving you a better overview while configuring workflows or viewing
            record details. This new layout is especially handy for workflows
            and the upcoming dashboards feature.
          </Trans>
        ),
        image: '/images/releases/1.12/1.12.0-side-panel.webp',
      },
      {
        title: msg`Granular Email Folder Sync`,
        description: (
          <Trans>
            Choose exactly which Gmail labels or Outlook folders to sync on your
            workspace. This gives you more control over your email data and
            better privacy by importing only the folders you need.
          </Trans>
        ),
        image: '/images/releases/1.12/1.12.0-folder-sync.webp',
      },
    ],
  },
  {
    release: '1.11.0',
    date: '2025-11-18',
    highlights: [
      {
        title: msg`Unlisted Views`,
        description: (
          <Trans>
            You can now create personal views that stay out of the shared
            Workspace section and appear instead under a separate{' '}
            <strong>My unlisted views</strong> section in the view picker. These
            unlisted views are only listed for their creator, but can still be
            opened by teammates via direct link.
          </Trans>
        ),
        image: '/images/releases/1.11/1.11.0-unlisted-views.webp',
      },
      {
        title: msg`Morph Many Relationships`,
        description: (
          <Trans>
            Create flexible relationships where a single field can connect to
            multiple different object types. For example, an Opportunity can now
            relate to either a Person or a Company, giving you more versatile
            data modeling capabilities.
          </Trans>
        ),
        image: '/images/releases/1.11/1.11.0-morph-relations.webp',
      },
    ],
  },
  {
    release: '1.10.0',
    date: '2025-11-11',
    highlights: [
      {
        title: msg`Calendar View for Objects`,
        description: (
          <Trans>
            You can now visualize your records in a monthly calendar view. This
            new view type makes it easy to track time-based data like events,
            deadlines, and scheduled activities directly within any object.
          </Trans>
        ),
        image: '/images/releases/1.10/1.10.0-calendar.webp',
      },
      {
        title: msg`Dashboards in Labs (Beta)`,
        description: (
          <Trans>
            Create custom charts and visualizations using your workspace data
            with the new Dashboards feature. Available in Labs, this beta
            feature lets you build powerful analytics and insights to monitor
            your business metrics.
          </Trans>
        ),
        image: '/images/releases/1.10/1.10.0-dashboards.webp',
      },
    ],
  },
  {
    release: '1.8.0',
    date: '2025-10-16',
    highlights: [
      {
        title: msg`Workflow Iterator Node`,
        description: (
          <Trans>
            You can now loop through items in your workflows using the new
            iterator node. This powerful feature allows you to process multiple
            records sequentially, performing actions on each item in a
            collection.
          </Trans>
        ),
        image: '/images/releases/1.8/1.8-workflow-iterator.webp',
      },
      {
        title: msg`Workflow Bulk Select`,
        description: (
          <Trans>
            Manual trigger workflows now support bulk selection, allowing you to
            select multiple records at once to pass into your workflow. This is
            particularly useful when combined with the iterator node to process
            several records in one workflow run.
          </Trans>
        ),
        image: '/images/releases/1.8/1.8-bulk-select.webp',
      },
      {
        title: msg`Workflow Search Node Limit`,
        description: (
          <Trans>
            The search node now lets you customize the result limit above 1,
            enabling you to retrieve multiple records in a single search
            operation. This enhancement works seamlessly with the iterator node
            for processing search results.
          </Trans>
        ),
        image: '/images/releases/1.8/1.8-search-limit.webp',
      },
    ],
  },
  {
    release: '1.7.0',
    date: '2025-10-02',
    highlights: [
      {
        title: msg`User impersonation`,
        description: (
          <Trans>
            You can now impersonate a workspace user as an admin. This allows
            you to see the workspace as that user would, which is useful for
            troubleshooting issues or understanding user experience.
          </Trans>
        ),
        image: '/images/releases/1.7/1.7-impersonating.webp',
      },
      {
        title: msg`Record is created or updated trigger`,
        description: (
          <Trans>
            You can now trigger workflows when a record is created or updated.
          </Trans>
        ),
        image: '/images/releases/1.7/1.7-upsert.webp',
      },
    ],
  },
  {
    release: '1.6.0',
    date: '2025-09-19',
    highlights: [
      {
        title: msg`Workflow improvements`,
        description: (
          <Trans>
            You now have the ability to duplicate nodes, change node types, and
            use a streamlined filter design in your workflows.
          </Trans>
        ),
        image: '/images/releases/1.6/1.6-workflows-improvements.webp',
      },
    ],
  },
  {
    release: '1.5.0',
    date: '2025-09-11',
    highlights: [
      {
        title: msg`Workflow branches`,
        description: (
          <Trans>
            Workflow branches allow workflows to split paths, enabling
            conditional logic and multiple outcome flows in automation.
          </Trans>
        ),
        image: '/images/releases/1.5/1.5-workflow-branches.webp',
      },
    ],
  },
  {
    release: '1.4.0',
    date: '2025-08-29',
    highlights: [
      {
        title: msg`Field Level Permission`,
        description: (
          <Trans>
            You can now control which fields a role can view or edit. This adds
            more granular access control on top of existing object-level
            permissions.
          </Trans>
        ),
        image: '/images/releases/1.4/1.4-field-permissions.webp',
      },
      {
        title: msg`Workflow Filters`,
        description: (
          <Trans>
            Add filters between workflow steps with conditions and only let data
            continue if it meets the criteria you define.
          </Trans>
        ),
        image: '/images/releases/1.4/1.4-workflow-filters.webp',
      },
      {
        title: msg`Two Factor Authentication`,
        description: (
          <Trans>
            Enabled two-factor authentication with authenticator apps like
            1Password, Authy, or Microsoft Authenticator to add an extra layer
            of security at sign-in.
          </Trans>
        ),
        image: '/images/releases/1.4/1.4-two-factor-auth.webp',
      },
    ],
  },
  {
    release: '1.3.0',
    date: '2025-08-11',
    highlights: [
      {
        title: msg`IMAP`,
        description: (
          <Trans>
            We’ve added IMAP support to let you connect email accounts for
            receiving messages. You can also set up SMTP to send emails and
            CalDAV to sync calendars.
          </Trans>
        ),
        image: '/images/releases/1.3/1.3-IMAP.webp',
      },
      {
        title: msg`Merge Records`,
        description: (
          <Trans>
            This feature gives you the ability to merge two records into one.
            This combines their information and keeps linked data, helping you
            remove duplicates and keep records accurate.
          </Trans>
        ),
        image: '/images/releases/1.3/1.3-merge.webp',
      },
    ],
  },
  {
    release: '1.2.0',
    date: '2025-07-25',
    highlights: [
      {
        title: msg`Import Relations`,
        description: (
          <Trans>
            When importing records, you can now import relations between
            records. For example, you can import a CSV file that includes a
            column for related records, such as linking contacts to companies or
            tasks to projects.
          </Trans>
        ),
        image: '/images/releases/1.2/1.2-import-relations.webp',
      },
      {
        title: msg`Any Field filter`,
        description: (
          <Trans>
            We’ve added an "any field search" filter that lets you search across
            all fields at once. For example, it can allow you to locate a
            customer by their phone number, whether it's stored in the "Mobile,"
            "Office," or "Direct Line" field.
          </Trans>
        ),
        image: '/images/releases/1.2/1.2-any-fields.webp',
      },
    ],
  },
  {
    release: '1.1.0',
    date: '2025-07-10',
    highlights: [
      {
        title: msg`Multi-Record Workflow Triggers`,
        description: (
          <Trans>
            You can now run workflows on many records at once. Previously,
            manual workflows could only be triggered one record at a time. This
            change improves productivity for bulk operations. With the ability
            to trigger workflows on many records, you can now: Send bulk emails
            to selected contacts Update many records with the same workflow
            logic Process batches of data more efficiently
          </Trans>
        ),
        image: '/images/releases/1.1/1.1-multi-manual-trigger.webp',
      },
    ],
  },
  {
    release: '1.00.0',
    date: '2025-06-25',
    highlights: [
      {
        title: msg`Permissions V2`,
        description: (
          <Trans>
            Create and manage custom roles. Grant or revoke access for each
            object to Read/Create/Edit/Delete records. Give granular access to
            settings like the ability to manage users, data models or APIs.
          </Trans>
        ),
        image: '/images/releases/1.00/1.00-permissions.webp',
      },
      {
        title: msg`Workflows`,
        description: (
          <Trans>
            Introducing workflows, a powerful way to let you automate actions
            with form triggers, conditions, HTTP requests, webhooks, and
            serverless functions!
          </Trans>
        ),
        image: '/images/releases/1.00/1.00-workflow.webp',
      },
      {
        title: msg`Import V2`,
        description: (
          <Trans>
            CSV import now supports 2,000+ rows, sub-fields such as labels and
            secondary phone numbers, and automatic field matching. Validations,
            layout, and upserts are improved for smoother, more accurate
            imports.
          </Trans>
        ),
        image: '/images/releases/1.00/1.00-import-update.webp',
      },
      {
        title: msg`Sub-field Filtering`,
        description: (
          <Trans>
            Sub-field filtering is now supported for currency, address, name,
            email, link, phone, and actor fields. For example, you can filter by
            the amount in a currency without needing the full field.
          </Trans>
        ),
        image: '/images/releases/1.00/1.00-subfield-filtering.webp',
      },
      {
        title: msg`Performance Improvements`,
        description: (
          <Trans>
            We’ve cut key load and interaction times by over 3,000ms, which
            means pages now load 2x faster!
          </Trans>
        ),
        image: '/images/releases/1.00/1.00-performance-improvement.webp',
      },
    ],
  },
  {
    release: '0.52.0',
    date: '2025-04-25',
    highlights: [
      {
        title: msg`Add records to filtered views`,
        description: (
          <Trans>
            Creating records on filtered views now applies the view filter to
            the newly created record. This feature is compatible with Text,
            Date_Time, Date, Number, Select, Rating, Multi_Select, Array, and
            Boolean fields.
          </Trans>
        ),
        image: '/images/releases/0.52.0/0.52-filtered-views-records.webp',
      },
      {
        title: msg`Custom date formats`,
        description: (
          <Trans>
            Choose how to display dates in any field using a universal Unicode
            date format that best suits your use case.
          </Trans>
        ),
        image: '/images/releases/0.52.0/0.52-custom-date-format.webp',
      },
      {
        title: msg`Other improvements`,
        description: (
          <Trans>
            A new breadcrumb navigation across the app, improved keyboard menu
            navigation, and a new focus state for table views.
          </Trans>
        ),
      },
    ],
  },
  {
    release: '0.51.0',
    date: '2025-03-27',
    highlights: [
      {
        title: msg`Revamp View Options Menu`,
        description: (
          <Trans>
            You can now rename a view and change its type between kanban or
            table directly from the view options menu located to the right of
            the filter and sort buttons.
          </Trans>
        ),
        image: '/images/releases/0.51.0/0.51-options-menu.webp',
      },
    ],
  },
  {
    release: '0.50.0',
    date: '2025-03-27',
    highlights: [
      {
        title: msg`Permissions V1`,
        description: (
          <Trans>
            Ability to set User and Admin permissions for each user. Admins can
            edit workspace settings, while Users can only edit records. Custom
            permission creation will be available in a future update.
          </Trans>
        ),
        image: '/images/releases/0.50/0.50-permissions.webp',
      },
      {
        title: msg`Advanced filters`,
        description: (
          <Trans>
            Advanced filter enables precise database content filtering through
            nested conditional operators (AND/OR), multiple field filters, and
            customizable filter groups for complex query construction.
          </Trans>
        ),
        image: '/images/releases/0.50/0.50-advanced-filters.webp',
      },
    ],
  },
  {
    release: '0.44.0',
    date: '2025-03-17',
    highlights: [
      {
        title: msg`New Side Panel`,
        description: (
          <Trans>
            <strong>Quick Access to Records</strong>: Side panel lets you view
            and edit records without leaving your current page.{' '}
            <strong>Keyboard Navigation</strong>: Navigate the side panel with
            keyboard for better accessibility and faster workflows.{' '}
            <strong>Pinned Actions</strong>: More actions now displayed directly
            in the navbar for easier access.
          </Trans>
        ),
        image: '/images/releases/0.44/0.44-side-panel.webp',
      },
      {
        title: msg`Admin Panel`,
        description: (
          <Trans>
            <strong>App Health Check</strong>: Added a health check feature to
            the admin panel. Now shows real-time status and key metrics.{' '}
            <strong>Environment Variables</strong>: Admin panel now has
            read-only access to environment variables. Better transparency,
            easier config management.
          </Trans>
        ),
        image: '/images/releases/0.44/0.44-admin-panel.webp',
      },
    ],
  },
  {
    release: '0.43.0',
    date: '2025-03-04',
    highlights: [
      {
        title: msg`Upgraded Search`,
        description: (
          <Trans>
            The search feature now includes ranking scores. This helps you find
            the most relevant results faster.
          </Trans>
        ),
        image: '/images/releases/0.43.0/search-upgrade.webp',
      },
      {
        title: msg`Internal Email Privacy`,
        description: (
          <Trans>
            Internal team emails won't sync, protecting privacy by preventing
            access to internal discussions.
          </Trans>
        ),
        image: '/images/releases/0.43.0/email-privacy.webp',
      },
    ],
  },
  {
    release: '0.42.0',
    date: '2025-02-18',
    highlights: [
      {
        title: msg`Microsoft o365 Integration`,
        description: (
          <Trans>
            You can now link your Microsoft account to easily manage your
            messages and events right within your workspace.
          </Trans>
        ),
        image: '/images/releases/0.42/0.42-microsoft.webp',
      },
      {
        title: msg`Translation in 30+ Languages`,
        description: (
          <Trans>
            Expanded support for 30+ languages, so users can navigate and use
            the software in their preferred language.
          </Trans>
        ),
        image: '/images/releases/0.42/0.42-translation.webp',
      },
      {
        title: msg`Attachment Visualizer`,
        description: (
          <Trans>
            You can now preview file attachments without downloading them.
          </Trans>
        ),
        image: '/images/releases/0.42/0.42-document-viewer.webp',
      },
    ],
  },
  {
    release: '0.41.0',
    date: '2025-02-04',
    highlights: [
      {
        title: msg`Labs`,
        description: (
          <Trans>
            Enable beta features using the new Labs tab in settings. The first
            beta release introduces our workflow engine. Enjoy!
          </Trans>
        ),
        image: '/images/releases/0.41/0.41-labs.webp',
      },
    ],
  },
  {
    release: '0.40.0',
    date: '2025-01-17',
    highlights: [
      {
        title: msg`View Groups`,
        description: (
          <Trans>
            Added "Group By" in tables to better organize entries, like grouping
            companies by industry for clearer data visualization. This feature
            is available in the table Options menu.
          </Trans>
        ),
        image: '/images/releases/0.40/0.40-group-by.webp',
      },
      {
        title: msg`Aggregates`,
        description: (
          <Trans>
            Introduced a feature to calculate and display data summaries, such
            as sums and latest entries, for quick insights and streamlined data
            analysis.
          </Trans>
        ),
        image: '/images/releases/0.40/0.40-aggregates.webp',
      },
    ],
  },
  {
    release: '0.35.0',
    date: '2024-12-20',
    highlights: [
      {
        title: msg`Favorites Views and Favorites Folders`,
        description: (
          <Trans>
            You can now add your views to favorites for quick access and
            organize your favorites into folders for better management.
          </Trans>
        ),
        image: '/images/releases/0.35/0.35-Favorites.webp',
      },
    ],
  },
  {
    release: '0.34.0',
    date: '2024-12-12',
    highlights: [
      {
        title: msg`Customize your sub-domain`,
        description: (
          <Trans>
            Each workspace now gets a dedicated sub-domain for a more secure
            experience. And soon you will be able to set your own domain.
          </Trans>
        ),
        image: '/images/releases/0.34/0.34-subdomains.webp',
      },
    ],
  },
  {
    release: '0.33.0',
    date: '2024-11-21',
    highlights: [
      {
        title: msg`Filter by Multi-Select`,
        description: (
          <Trans>
            You can now filter an object (People, Companies, Opportunities,
            etc.) using any multiselect field.
          </Trans>
        ),
        image: '/images/releases/0.33/0.33-multiselect-filter.webp',
      },
      {
        title: msg`Percentage in number fields`,
        description: (
          <Trans>
            You can now create number fields that display a percentage instead
            of a regular number.
          </Trans>
        ),
        image: '/images/releases/0.33/0.33-percentage-number.webp',
      },
    ],
  },
  {
    release: '0.32.0',
    date: '2024-11-12',
    highlights: [
      {
        title: msg`Smart ⌘K`,
        description: (
          <Trans>
            We started a major ⌘K revamp that now understands the context to
            display appropriate actions. For example, on a record page, you can
            add the record as a favorite, or if you select multiple records on
            an index, you can export them as a CSV.
          </Trans>
        ),
        image: '/images/releases/0.32/0.32-improved-cmdk.webp',
      },
      {
        title: msg`Webhooks multi-object filtering`,
        description: (
          <Trans>
            You can now filter multiple actions simultaneously with a single
            webhook. For example, you can create a webhook that triggers only
            when a person or company is updated or created.
          </Trans>
        ),
        image: '/images/releases/0.32/0.32-webhooks.webp',
      },
    ],
  },
  {
    release: '0.31.0',
    date: '2024-10-07',
    highlights: [
      {
        title: msg`Advanced Settings`,
        description: (
          <Trans>
            To maintain the simplicity of Twenty, we are introducing "Advanced
            Settings." This option consolidates all settings intended for
            advanced use cases, often preferred by developers, such as API and
            function settings or security settings.
          </Trans>
        ),
        image: '/images/releases/0.31/0.31-advanced-settings.webp',
      },
      {
        title: msg`More powerful search`,
        description: (
          <Trans>
            We have significantly enhanced our search performance, making it
            feel instantaneous when searching for records such as people,
            companies, or tasks.
          </Trans>
        ),
        image: '/images/releases/0.31/0.31-search.webp',
      },
    ],
  },
  {
    release: '0.30.0',
    date: '2024-09-18',
    highlights: [
      {
        title: msg`New Settings layout`,
        description: (
          <Trans>
            Experience a more compact and intuitive settings layout, now
            featuring a breadcrumb navigation for easier access and better
            organization.
          </Trans>
        ),
        image: '/images/releases/0.30/0.30-new-settings.webp',
      },
      {
        title: msg`Add Several emails for one contact`,
        description: (
          <Trans>
            Enhance your contact management by adding many email addresses for a
            single contact. All emails sent to these addresses will be
            automatically synced with the contact, ensuring you never miss an
            important communication.
          </Trans>
        ),
        image: '/images/releases/0.30/0.30-emails.webp',
      },
      {
        title: msg`New Array field type`,
        description: (
          <Trans>
            Developers can now take advantage of the new array field type to
            store non-predefined values.
          </Trans>
        ),
        image: '/images/releases/0.30/0.30-array-field.webp',
      },
    ],
  },
  {
    release: '0.24.0',
    date: '2024-08-29',
    highlights: [
      {
        title: msg`Soft Delete`,
        description: (
          <Trans>
            Soft delete feature added: Deleted records are now hidden from view
            but recoverable from the "Deleted record" option in any object
            options menu. No more drama!
          </Trans>
        ),
        image: '/images/releases/0.24/0.24-soft-delete.webp',
      },
    ],
  },
  {
    release: '0.23.0',
    date: '2024-08-01',
    highlights: [
      {
        title: msg`Notes and Tasks standard objects`,
        description: (
          <Trans>
            Like any regular object, add some custom fields to your tasks and
            companies or create some custom views to better organize your
            content.
          </Trans>
        ),
        image: '/images/releases/0.23/0.23-notes-tasks.webp',
      },
      {
        title: msg`Created By`,
        description: (
          <Trans>
            Quickly identify who created a given record and what was the origin
            of the creation, whether it was through a CSV import, an API, or
            manual input.
          </Trans>
        ),
        image: '/images/releases/0.23/0.23-created-by.webp',
      },
      {
        title: msg`Webhooks filter`,
        description: (
          <Trans>
            Filter the content a webhook is returning so it only pings your URL
            when a specific action occurs, such as on creating a company.
          </Trans>
        ),
        image: '/images/releases/0.23/0.23-filter-webhooks.webp',
      },
    ],
  },
  {
    release: '0.22.0',
    date: '2024-07-11',
    highlights: [
      {
        title: msg`Enhanced Kanban Board`,
        description: (
          <Trans>
            <strong>Edit Kanban Stages:</strong> You can now edit Kanban stages
            directly from the app, not just from the settings. This makes it
            easier to manage and customize your workflow on the fly.{' '}
            <strong>"No Value" Column:</strong> Cards that are not assigned to a
            specific value will now appear in a "No Value" column. This column
            can be shown or hidden as needed, ensuring no cards are overlooked.
          </Trans>
        ),
        image: '/images/releases/0.22/0.22-kanban-improvements.webp',
      },
      {
        title: msg`Revamped Navigation Bar`,
        description: (
          <Trans>
            Navigate more quickly with our revamped record page navbar: Navigate
            directly from one record page to another. View the total number of
            records within a view. Easily return to the corresponding index view
            with a new "Close" button.
          </Trans>
        ),
        image: '/images/releases/0.22/0.22-navbar.webp',
      },
      {
        title: msg`Bulk Deletion`,
        description: (
          <Trans>
            You can now delete up to 10,000 records at once. (For when you want
            to Marie Kondo your database! 🧹)
          </Trans>
        ),
        image: '/images/releases/0.22/0.22-mass-deletion.webp',
      },
    ],
  },
  {
    release: '0.21.0',
    date: '2024-06-28',
    highlights: [
      {
        title: msg`Enhanced One-to-Many Relations Editing`,
        description: (
          <Trans>
            You can now edit one-to-many relations directly from the "many
            side". This means you can assign people to a company directly from
            the company list view, instead of having to navigate to each
            individual person's profile to assign them a company.
          </Trans>
        ),
        image: '/images/releases/0.21/0.21-many-many.webp',
      },
      {
        title: msg`Advanced Email and Calendar Settings`,
        description: (
          <Trans>
            We've introduced advanced settings for email and calendar
            management: <strong>Auto-Create Contact Options:</strong> Choose
            when an email interaction should automatically create a contact.
            Options include: People I've sent emails to and received emails from
            People I've sent emails to Don't auto create contact{' '}
            <strong>Email Exclusions:</strong> Ability to exclude
            non-professional emails (e.g., Gmail, Outlook) and team emails
            (e.g., support@, team@) from being synced to the CRM.{' '}
            <strong>Calendar Events:</strong> Auto-contact creation settings are
            now available for calendar events as well.
          </Trans>
        ),
        image: '/images/releases/0.21/0.21-advanced-email-settings.webp',
      },
    ],
  },
  {
    release: '0.20.0',
    date: '2024-06-14',
    highlights: [
      {
        title: msg`Enhanced Timeline`,
        description: (
          <Trans>
            The timeline on every record page has been significantly improved.
            It now provides detailed updates for: Record creations Field updates
            Received emails Created calendar events
          </Trans>
        ),
        image: '/images/releases/0.20/0.20-timeline.webp',
      },
      {
        title: msg`Improved Onboarding Experience`,
        description: (
          <Trans>
            Our onboarding process has been streamlined to let you import your
            calendar and emails seamlessly. You can now also configure your
            privacy settings directly during onboarding, allowing you to choose
            between sharing content with your team or keeping it hidden.
          </Trans>
        ),
        image: '/images/releases/0.20/0.20-onboarding.webp',
      },
      {
        title: msg`Email and calendar Blocklist`,
        description: (
          <Trans>
            To enhance privacy, you can now add specific email addresses to a
            blocklist within the "Accounts" settings. This feature prevents
            sensitive content from being synced to the CRM when corresponding
            with certain individuals. This can be particularly useful when
            managing sensitive deals.
          </Trans>
        ),
        image: '/images/releases/0.20/0.20-blocklist.webp',
      },
    ],
  },
  {
    release: '0.12.0',
    date: '2024-05-24',
    highlights: [
      {
        title: msg`Notifications`,
        description: (
          <Trans>
            Introduced a new design for notifications featuring lighter colors.
          </Trans>
        ),
        image: '/images/releases/0.12/0.12-notifications.webp',
      },
      {
        title: msg`Skeleton Loading`,
        description: (
          <Trans>
            Implemented skeleton loading to improve user experience by
            displaying placeholder content while data is being fetched.
          </Trans>
        ),
        image: '/images/releases/0.12/0.12-loader.webp',
      },
      {
        title: msg`Link field`,
        description: (
          <Trans>
            Introduced a new Link Field type to add and manage one or several
            external URLs on any object. Available in custom objects starting
            today.
          </Trans>
        ),
        image: '/images/releases/0.12/0.12-link-field.webp',
      },
      {
        title: msg`Data Model Diagram`,
        description: (
          <Trans>
            Introduced a "Data Model Diagram" feature that allows users to
            visualize the relationships between different objects within the
            CRM.
          </Trans>
        ),
        image: '/images/releases/0.12/0.12-database-diagram.webp',
      },
    ],
  },
  {
    release: '0.11.0',
    date: '2024-05-06',
    highlights: [
      {
        title: msg`Google Calendar Integration`,
        description: (
          <Trans>
            With Google Calendar integration, you can track all your team's
            events with a company or person in your CRM. Choose the information
            level visible to your teammates for better control.
          </Trans>
        ),
        image: '/images/releases/0.11/0.11-calendar.webp',
      },
      {
        title: msg`Improved Performance`,
        description: (
          <Trans>
            We have improved app performance, shaving off over 500ms on each
            page.
          </Trans>
        ),
        image: '/images/releases/0.11/0.11-speed.webp',
      },
    ],
  },
  {
    release: '0.10.0',
    date: '2024-04-15',
    highlights: [
      {
        title: msg`More Field Types, More Power`,
        description: (
          <Trans>
            Enhance your data handling capabilities with the addition of four
            new field types:
          </Trans>
        ),
      },
      {
        title: msg`Multi-Select Field`,
        description: (
          <Trans>
            The <code>Multi-Select Field</code> allows for tagging a record with
            multiple attributes, providing a flexible way to classify and filter
            data. <strong>Example Use Case</strong>: Tag a company record with
            multiple industries such as "Retail," "Technology," and "Finance,"
            enabling more nuanced segmentation and analysis.
          </Trans>
        ),
        image: '/images/releases/0.10/0.10-multi-select.webp',
      },
      {
        title: msg`Currency Field`,
        description: (
          <Trans>
            Designed specifically for financial data, the{' '}
            <code>Currency Field</code> ensures correct calculation and standard
            formatting for monetary figures. <strong>Example Use Case</strong>:
            Record and manage global transactions in their original currencies
            while maintaining precision in financial reporting.
          </Trans>
        ),
        image: '/images/releases/0.10/0.10-currency.webp',
      },
      {
        title: msg`Datetime Field`,
        description: (
          <Trans>
            With the <code>Datetime Field</code>, you can effectively track
            events, deadlines, and activities with enhanced accuracy, improving
            time management and scheduling. <strong>Example Use Case</strong>:
            Precisely track and set reminders for project milestones and
            deadlines.
          </Trans>
        ),
        image: '/images/releases/0.10/0.10-datetime.webp',
      },
      {
        title: msg`JSON Field`,
        description: (
          <Trans>
            The <code>JSON Field</code> allows for the storage of complex,
            structured data within a single field, thus expanding the
            capabilities for data customisation and integration.{' '}
            <strong>Example Use Case</strong>: Store configurable data for a
            product, such as feature flags or customization options, directly
            within a CRM record.
          </Trans>
        ),
        image: '/images/releases/0.10/0.10-json.webp',
      },
    ],
  },
  {
    release: '0.4.0',
    date: '2024-04-01',
    highlights: [
      {
        title: msg`Relation Fields on Record Page`,
        description: (
          <Trans>
            On record pages, you can now expand relation cards to view their
            fields without navigating to their individual record pages. For
            example, on a Company record page, you can expand an employee card
            to view their job title. This feature applies to all types of
            objects, including custom ones.
          </Trans>
        ),
        image: '/images/releases/0.4/0.4-expand-relation-card.webp',
      },
      {
        title: msg`Address Field Type`,
        description: (
          <Trans>
            The new <code>Address Field</code> Type enables entry of a full
            address in one field, while structurally storing each address part -
            such as street name and number - in separate subfields.
          </Trans>
        ),
        image: '/images/releases/0.4/0.4-address-field-type.webp',
      },
      {
        title: msg`Multi-Workspace`,
        description: (
          <Trans>
            You can now switch between workspaces by clicking your workspace
            name at the top left of the screen. This feature will only appear if
            you have been invited to join another workspace.
          </Trans>
        ),
        image: '/images/releases/0.4/0.4-multi-workspace.webp',
      },
    ],
  },
  {
    release: '0.3.3',
    date: '2024-03-19',
    highlights: [
      {
        title: msg`Gmail integration`,
        description: (
          <Trans>
            Connect your Gmail account to automatically associate emails with
            relevant 'People' and 'Companies'. Contacts you've emailed will be
            automatically added to 'People', excluding non-personal emails like
            ﻿support@ and ﻿team@. Control your privacy by selecting the
            information you share with your team.
          </Trans>
        ),
        image: '/images/releases/0.3.3_emails.webp',
      },
      {
        title: msg`Kanbans on any object`,
        description: (
          <Trans>
            Create a Kanban view on any object and streamline processes like
            recruitment or onboarding.
          </Trans>
        ),
        image: '/images/releases/0.3.3_kanban.webp',
      },
      {
        title: msg`Self-Onboarding`,
        description: (
          <Trans>
            We are pleased to reopen the cloud subscription to everyone. No more
            waiting!
          </Trans>
        ),
        image: '/images/releases/0.3.3_sign_up.webp',
      },
    ],
  },
  {
    release: '0.3.2',
    date: '2024-02-29',
    highlights: [
      {
        title: msg`New record page`,
        description: (
          <Trans>
            The record page now features a clearer layout with increased space
            for content
          </Trans>
        ),
        image: '/images/releases/0.3.2_new_layout.webp',
      },
    ],
  },
  {
    release: '0.3.1',
    date: '2024-02-16',
    highlights: [
      {
        title: msg`Contributors page`,
        description: (
          <Trans>Contributors now have their very own hall of fame.</Trans>
        ),
        image: '/images/releases/0.3.1_contributors.webp',
      },
    ],
  },
  {
    release: '0.3.0',
    date: '2024-02-03',
    highlights: [
      {
        title: msg`Rating field`,
        description: (
          <Trans>
            The new Rating field represents a numeric value from zero to five,
            it can be useful for various use-cases such as scoring leads.
          </Trans>
        ),
        image: '/images/releases/0.3.0_rating.webp',
      },
    ],
  },
  {
    release: '0.2.3',
    date: '2024-01-17',
    highlights: [
      {
        title: msg`Webhooks`,
        description: (
          <Trans>
            Developers can now use webhooks to synchronize customer data updates
            in real-time across applications.
          </Trans>
        ),
        image: '/images/releases/0.2.3_webhooks.webp',
      },
      {
        title: msg`Relations on Record Pages`,
        description: (
          <Trans>
            You can now navigate from one object to another directly from the
            record detail page.
          </Trans>
        ),
        image: '/images/releases/0.2.3_relations.webp',
      },
    ],
  },
];
