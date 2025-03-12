import { collection, config, fields } from '@keystatic/core';
import { wrapper } from '@keystatic/core/content-components';

export default config({
  storage: {
    kind: 'github',
    repo: {
      owner: 'twentyhq',
      name: 'twenty',
    },
    pathPrefix: 'packages/twenty-website',
  },
  collections: {
    developers: collection({
      label: 'Technical documentation',
      slugField: 'title',
      path: 'src/content/developers/**',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        icon: fields.text({ label: 'Icon' }),
        image: fields.text({ label: 'Image' }),
        info: fields.text({ label: 'Info' }),
        content: fields.mdx({
          label: 'Content',
          components: {
            ArticleEditContent: wrapper({
              label: 'ArticleEditContent',
              schema: {},
            }),
          },
        }),
      },
    }),
    releases: collection({
      label: 'Releases',
      slugField: 'release',
      path: 'src/content/releases/*',
      format: { contentField: 'content' },
      schema: {
        release: fields.slug({ name: { label: 'Release' } }),
        // TODO: Define the date with a normalized format
        Date: fields.text({ label: 'Date' }),
        content: fields.mdx({
          label: 'Content',
        }),
      },
    }),
  },
});
