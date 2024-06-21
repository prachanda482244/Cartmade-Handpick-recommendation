import { Spinner } from "@shopify/polaris";

const Loader = () => {
  return (
    <div className="text-2xl flex items-center justify-center h-40 w-[55vw] mx-auto">
      <Spinner accessibilityLabel="Loading spinner" size="large" />
    </div>
  );
};

export default Loader;
