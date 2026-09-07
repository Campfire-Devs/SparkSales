import PageTemplate from "../components/ui/PageTemplate";

function RegisterBusiness() {
  return (
    <PageTemplate
      title="Register Business 🏪"
      description="Create and configure a business profile on SparkSales."
      purpose="This page will allow a new entrepreneur to provide the information required to create their business profile."
      functionality={[
        "Enter business name.",
        "Enter business description.",
        "Select business category.",
        "Enter business contact information.",
        "Enter business location.",
        "Validate business information.",
        "Create the business profile.",
      ]}
      status="Planning"
    />
  );
}

export default RegisterBusiness;