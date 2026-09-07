import { Wallet } from "lucide-react";
import PageTemplate from "../components/ui/PageTemplate";

const Expenses = () => {
  return (
    <PageTemplate
      icon={<Wallet size={24} />}
      title="Expenses"
      description="Track the money your business spends throughout Entrepreneurship Day."
      purpose="The Expenses page keeps a record of business costs so that accurate profit and loss calculations can be produced."
      functionality={[
        "Record a new business expense.",
        "Categorise expenses such as stock, transport, marketing, and equipment.",
        "Enter expense amount and payment method.",
        "View all recorded expenses.",
        "Search and filter expenses.",
        "Edit incorrect expense records.",
        "Delete expenses with confirmation.",
        "Automatically update total expenses.",
      ]}
    />
  );
};

export default Expenses;