import { global } from '@apollo/client/utilities/globals';
import { collection, config, fields } from '@keystatic/core';
import { wrapper } from '@keystatic/core/content-components';

console.log({
  KEYSTATIC_GITHUB_CLIENT_ID: process.env.KEYSTATIC_GITHUB_CLIENT_ID?.slice(
    0,
    2,
  ),
  KEYSTATIC_GITHUB_CLIENT_SECRET:
    process.env.KEYSTATIC_GITHUB_CLIENT_SECRET?.slice(0, 2),
  KEYSTATIC_SECRET: process.env.KEYSTATIC_SECRET?.slice(0, 2),
  NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG:
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG?.slice(0, 2),
  GITHUB_TOKEN: global.process.env.GITHUB_TOKEN?.slice(0, 2),
  GITHUB_TOKEN_2: process.env.GITHUB_TOKEN?.slice(0, 2),
});

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
