import {
  Button,
  DashboardRouteDefinition,
  Page,
  PageTitle,
  PageActionBar,
  PageActionBarRight,
  PageLayout,
  PageBlock,
  FormFieldWrapper,
  Input,
  PermissionGuard,
  detailPageRouteLoader,
  useDetailPage,
} from '@vendure/dashboard';
import { toast } from 'sonner';
import { graphql } from '@/gql'; // provided by vendureDashboardPlugin
import type { AnyRoute } from '@tanstack/react-router';

// 1) Typed GraphQL documents
const getSettingsDocument = graphql(`
  query GetSiteSettings {
    siteSettingsSingleton {
      id
      title
      primaryColor
      accountHeading
    }
  }
`);

const updateSettingsDocument = graphql(`
  mutation UpdateSiteSettings($input: UpdateSiteSettingsInput!) {
    updateSiteSettings(input: $input) {
      id
      title
      primaryColor
      accountHeading
    }
  }
`);

// 2) Route registration (Settings → Site Settings)
export const siteSettingsRoute: DashboardRouteDefinition = {
  navMenuItem: {
    sectionId: 'settings',
    id: 'site-settings',
    url: '/site-settings',
    title: 'Site Settings',
  },
  path: '/site-settings',
  loader: detailPageRouteLoader({
    queryDocument: getSettingsDocument,
    breadcrumb: () => ['Settings', 'Site Settings'],
  }),
  component: route => <SiteSettingsPage route={route} />,
};

// 3) Page component using useDetailPage (no Apollo imports)
function SiteSettingsPage({ route }: { route: AnyRoute }) {
  const { form, submitHandler, isPending } = useDetailPage({
    queryDocument: getSettingsDocument,
    updateDocument: updateSettingsDocument,
    // map current entity => update payload
    setValuesForUpdate: s => ({
      id: s?.id ?? '',
      title: s?.title ?? 'My Store',
      primaryColor: s?.primaryColor ?? '#3b82f6',
      accountHeading: s?.accountHeading ?? 'My Account',
    }),
    route,
    onSuccess: () => toast('Settings updated'),
    onError: err =>
      toast('Failed to update settings', {
        description: err instanceof Error ? err.message : String(err),
      }),
  });

  return (
    <Page pageId="site-settings" form={form} submitHandler={submitHandler}>
      <PageTitle>Site Settings</PageTitle>
      <PageActionBar>
        <PageActionBarRight>
          <PermissionGuard requires={['SuperAdmin']}>
            <Button
              type="submit"
              disabled={!form.formState.isDirty || !form.formState.isValid || isPending}
            >
              Save
            </Button>
          </PermissionGuard>
        </PageActionBarRight>
      </PageActionBar>

      <PageLayout>
        <PageBlock column="main" blockId="main">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormFieldWrapper
              control={form.control}
              name="title"
              label="Site Title"
              render={({ field }) => <Input {...field} placeholder="My Store" />}
            />
            <FormFieldWrapper
              control={form.control}
              name="accountHeading"
              label="Account Heading"
              render={({ field }) => <Input {...field} placeholder="My Account" />}
            />
            <FormFieldWrapper
              control={form.control}
              name="primaryColor"
              label="Primary Color"
              render={({ field }) => (
                <input
                  type="color"
                  value={field.value ?? '#3b82f6'}
                  onChange={e => field.onChange(e.target.value)}
                  className="h-10 w-20 rounded border"
                />
              )}
            />
          </div>
        </PageBlock>
      </PageLayout>
    </Page>
  );
}
