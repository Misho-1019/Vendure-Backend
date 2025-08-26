import { defineDashboardExtension, Page, PageTitle, PageActionBar, PageActionBarRight, Button, PageLayout, PageBlock, FormFieldWrapper, Input } from '@vendure/dashboard';
import { graphql, useMutation, useQuery } from '@vendure/dashboard';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const GET = graphql(`
  query GetSiteSettings {
    siteSettings { id title primaryColor }
  }
`);

const UPDATE = graphql(`
  mutation UpdateSiteSettings($input: UpdateSiteSettingsInput!) {
    updateSiteSettings(input: $input) { id title primaryColor }
  }
`);

function SiteSettingsPage() {
  const [{ data, fetching }] = useQuery({ query: GET });
  const [, update] = useMutation(UPDATE);
  const form = useForm<{ title: string; primaryColor: string }>({
    defaultValues: { title: data?.siteSettings?.title ?? 'My Store', primaryColor: data?.siteSettings?.primaryColor ?? '#3b82f6' },
    values: data?.siteSettings ? { title: data.siteSettings.title, primaryColor: data.siteSettings.primaryColor } : undefined,
  });

  async function onSubmit(values: { title: string; primaryColor: string }) {
    await update({ input: values });
    toast('Site settings saved');
  }

  return (
    <Page pageId="site-settings" form={form} submitHandler={form.handleSubmit(onSubmit)}>
      <PageTitle>Site Settings</PageTitle>
      <PageActionBar>
        <PageActionBarRight>
          <Button type="submit" disabled={fetching || !form.formState.isDirty || !form.formState.isValid}>Save</Button>
        </PageActionBarRight>
      </PageActionBar>
      <PageLayout>
        <PageBlock column="main" blockId="basic">
          <FormFieldWrapper control={form.control} name="title" label="Site Title" render={({ field }) => <Input {...field} />} />
          <div style={{ height: 12 }} />
          <FormFieldWrapper control={form.control} name="primaryColor" label="Primary Color" render={({ field }) => <Input type="color" {...field} />} />
        </PageBlock>
      </PageLayout>
    </Page>
  );
}

export default defineDashboardExtension({
  routes: [
    {
      path: '/site-settings',
      navMenuItem: { sectionId: 'settings', id: 'site-settings', url: '/site-settings', title: 'Site Settings' },
      loader: () => ({ breadcrumb: 'Site Settings' }),
      component: () => <SiteSettingsPage />,
    },
  ],
});
