import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Card, Layout, Page } from "@shopify/polaris";

export const loader: LoaderFunction = ({ request }: LoaderFunctionArgs) => {
  return 1;
};

const Settings = () => {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <h1>Settings</h1>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Settings;
