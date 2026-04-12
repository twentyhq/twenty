import { collection, config, fields } from '@keystatic/core';

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
    releases: collection({
      label: 'Releases',
      slugField: 'release',
      path: 'src/content/releases/*',
      format: { contentField: 'content' },
      schema: {
        release: fields.slug({
          name: {
            label: 'Release',
            validation: {
              pattern: {
                regex: /^\d+\.\d+\.\d+$/,
                message: 'The release must be in the format major.minor.patch',
              },
            },
          },
          slug: {
            generate: (name) => name,
            validation: {
              pattern: {
                regex: /^\d+\.\d+\.\d+$/,
                message: 'The release must be in the format major.minor.patch',
              },
            },
          },
        }),
        Date: fields.date({
          label: 'Date',
          validation: { isRequired: true },
        }),
        content: fields.mdx({
          label: 'Content',
          options: {
            image: {
              directory: 'public/images/releases',
              publicPath: '/images/releases/',
            },
          },
        }),
      },
      parseSlugForSort: (slug) => {
        const [major, minor, patch] = slug.split('.');

        return `${major.padStart(4, '0')}.${minor.padStart(4, '0')}.${patch.padStart(4, '0')}`;
      },
    }),
  },
});
