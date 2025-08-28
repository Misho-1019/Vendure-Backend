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
import { gql } from 'graphql-tag';

// --- GraphQL docs (Admin API) ---
const getSettingsDocument = gql`
  query GetSiteSettings {
    siteSettingsSingleton {
      id
      title
      primaryColor
      accountHeading
    }
  }
` as any;

const updateSettingsDocument = gql`
  mutation UpdateSiteSettings($input: UpdateSiteSettingsInput!) {
    updateSiteSettings(input: $input) {
      id
      title
      primaryColor
      accountHeading
    }
  }
` as any;

// --- Route under Settings ---
export const siteSettingsRoute: DashboardRouteDefinition = {
  navMenuItem: {
    sectionId: 'settings',
    id: 'site-settings',
    url: '/site-settings',
    title: 'Site Settings',
  },
  path: '/site-settings',
  loader: detailPageRouteLoader({
    queryDocument: getSettingsDocument as any,
    breadcrumb: () => ['Settings', 'Site Settings'],
  }),
  component: () => <SiteSettingsPage />,
};

// --- Page (singleton) ---
function SiteSettingsPage() {
  // Cast the hook itself and options to any to bypass strict generic inference differences
  const { form, submitHandler, isPending } = (useDetailPage as any)({
    queryDocument: getSettingsDocument as any,
    updateDocument: updateSettingsDocument as any,
    params: {} as any, // some versions expect params; singleton => empty
    setValuesForUpdate: (s: any) => ({
      id: s?.id ?? '',
      title: s?.title ?? 'My Store',
      primaryColor: s?.primaryColor ?? '#3b82f6',
      accountHeading: s?.accountHeading ?? 'My Account',
    }),
    onSuccess: () => toast('Settings updated'),
    onError: (err: unknown) =>
      toast('Failed to update settings', {
        description: err instanceof Error ? err.message : String(err),
      }),
  }) as any;

  return (
    <Page pageId="site-settings" form={form as any} submitHandler={submitHandler}>
      <PageTitle>Site Settings</PageTitle>

      <PageActionBar>
        <PageActionBarRight>
          <PermissionGuard requires={['SuperAdmin']}>
            <Button
              type="submit"
              disabled={!form.formState?.isDirty || !form.formState?.isValid || isPending}
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
              control={(form as any).control}
              name={'title' as any}
              label="Site Title"
              render={({ field }: any) => <Input {...field} placeholder="My Store" />}
            />
            <FormFieldWrapper
              control={(form as any).control}
              name={'accountHeading' as any}
              label="Account Heading"
              render={({ field }: any) => <Input {...field} placeholder="My Account" />}
            />
            <FormFieldWrapper
              control={(form as any).control}
              name={'primaryColor' as any}
              label="Primary Color"
              render={({ field }: any) => (
                <input
                  type="color"
                  value={field.value ?? '#3b82f6'}
                  onChange={(e) => field.onChange(e.target.value)}
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

export default SiteSettingsPage;
