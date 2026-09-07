import { LayoutDashboard } from "lucide-react";
import PageTemplate from "../components/ui/PageTemplate";

const Dashboard = () => {
  return (
    <PageTemplate
      icon={<LayoutDashboard size={24} />}
      title="Dashboard"
      description="Get a real-time overview of your business performance during Entrepreneurship Day."
      purpose="The dashboard gives student entrepreneurs a quick view of their sales, expenses, profit, commission, and overall financial performance."
      functionality={[
        "Display total revenue generated from recorded sales.",
        "Display total business expenses.",
        "Calculate and display gross profit or loss.",
        "Calculate the SparkSales commission.",
        "Display final net profit or loss.",
        "Show sales activity throughout the trading period.",
        "Display recent transactions.",
        "Provide quick actions for recording sales and expenses.",
      ]}
    />
  );
};

export default Dashboard;