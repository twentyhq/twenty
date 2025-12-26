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
          @UseGuards(UserAuthGuard, NoPermissionGuard)
          testQuery() {}
        }
      `,
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
          testQuery() {}
        }
      `,
    },
    {
      code: `
        class TestResolver {
          @Query()
          @UseGuards(PublicEndpointGuard, NoPermissionGuard)
          testQuery() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(UserAuthGuard, NoPermissionGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(PublicEndpointGuard, NoPermissionGuard)
        class TestResolver {
          @Query()
          testQuery() {}
        }
      `,
    },
    {
      code: `
        class TestResolver {
          @Subscription()
          @UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
          testSubscription() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
        class TestResolver {
          @Subscription()
          testSubscription() {}
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
    {
      code: `
        @UseGuards(WorkspaceAuthGuard, SettingsPermissionsGuard(PermissionFlagType.WORKSPACE))
        class TestResolver {
          @Mutation(() => String)
          async createSomething() {}
        }
      `,
    },
    {
      code: `
        class TestResolver {
          @Mutation(() => String)
          @UseGuards(WorkspaceAuthGuard, SettingsPermissionsGuard(PermissionFlagType.WORKSPACE))
          async createSomething() {}
        }
      `,
    },
    {
      code: `
        class TestResolver {
          @Mutation(() => String)
          @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
          async createSomething() {}
        }
      `,
    },
    {
      code: `
        @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
        class TestResolver {
          @Mutation(() => String)
          async createSomething() {}
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
          @UseGuards(UserAuthGuard)
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
    {
      code: `
        class TestResolver {
          @Subscription()
          @UseGuards(WorkspaceAuthGuard)
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
        @UseGuards(WorkspaceAuthGuard)
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
          @Mutation(() => String)
          @UseGuards(WorkspaceAuthGuard)
          async createSomething() {}
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
        @UseGuards(WorkspaceAuthGuard)
        class TestResolver {
          @Mutation(() => String)
          async createSomething() {}
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
