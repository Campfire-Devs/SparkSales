import PageTemplate from "../components/ui/PageTemplate";

function Login() {
  return (
    <PageTemplate
      title="Login 🔐"
      description="Authenticate users before they access their SparkSales business environment."
      purpose="The Login page will securely authenticate registered users and direct them to the appropriate part of the application."
      functionality={[
        "Enter email address.",
        "Enter password.",
        "Validate login credentials.",
        "Display authentication errors.",
        "Remember authenticated sessions.",
        "Redirect authenticated users to the dashboard.",
        "Provide a link to business registration.",
      ]}
      status="Planning"
    />
  );
}

export default Login;