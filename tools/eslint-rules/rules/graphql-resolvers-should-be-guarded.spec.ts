import { TSESLint } from '@typescript-eslint/utils';

import { rule, RULE_NAME } from './graphql-resolvers-should-be-guarded';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(UserAuthGuard)
          testQuery() {}
        }
      `,
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(WorkspaceAuthGuard)
          testQuery() {}
        }
      `,
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(PublicEndpointGuard)
          testQuery() {}
        }
      `,
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(CaptchaGuard, PublicEndpointGuard)
          testQuery() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(UserAuthGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(PublicEndpointGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
    },
    {
      code: `
        class TestResolver {
          regularMethod() {}
        }
      `,
    },
    {
      code: `
        class TestResolver {
          @ResolveField()
          testField() {}
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
      errors: [
        {
          messageId: 'graphqlResolversShouldBeGuarded',
        },
      ],
    },
    {
      code: `
        class TestResolver {
          @Mutation()
          testMutation() {}
        }
      `,
      errors: [
        {
          messageId: 'graphqlResolversShouldBeGuarded',
        },
      ],
    },
    {
      code: `
        class TestResolver {
          @Subscription()
          testSubscription() {}
        }
      `,
      errors: [
        {
          messageId: 'graphqlResolversShouldBeGuarded',
        },
      ],
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(CaptchaGuard)
          testQuery() {}
        }
      `,
      errors: [
        {
          messageId: 'graphqlResolversShouldBeGuarded',
        },
      ],
    },
    {
      code: `
        @UseGuards(CaptchaGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
      errors: [
        {
          messageId: 'graphqlResolversShouldBeGuarded',
        },
      ],
    },
  ],
}); 