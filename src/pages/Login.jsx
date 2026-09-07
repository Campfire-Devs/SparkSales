import { LogIn } from "lucide-react";
import PageTemplate from "../components/ui/PageTemplate";

const Login = () => {
  return (
    <PageTemplate
      icon={<LogIn size={24} />}
      title="Login"
      description="Securely access your SparkSales business dashboard."
      purpose="The Login page allows registered student entrepreneurs to access their SparkSales account."
      functionality={[
        "Email and password authentication.",
        "Remember me functionality.",
        "Forgot password functionality.",
        "Validation for incorrect credentials.",
        "Secure authentication feedback.",
        "Redirect authenticated users to the dashboard.",
      ]}
    />
  );
};

export default Login;