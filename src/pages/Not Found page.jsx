import PageTemplate from "../components/ui/PageTemplate";

function NotFound() {
  return (
    <PageTemplate
      title="Page Not Found 🔎"
      description="The requested page could not be found."
      purpose="This page will be displayed when a user navigates to a URL that does not exist within SparkSales."
      functionality={[
        "Display a clear 404 message.",
        "Provide a link back to the homepage.",
        "Provide a link to the dashboard when authenticated.",
      ]}
      status="Planning"
    />
  );
}

export default NotFound;