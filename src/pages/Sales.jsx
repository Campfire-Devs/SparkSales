import { ShoppingCart } from "lucide-react";
import PageTemplate from "../components/ui/PageTemplate";

const Sales = () => {
  return (
    <PageTemplate
      icon={<ShoppingCart size={24} />}
      title="Sales"
      description="Record and manage every sale made by your business during Entrepreneurship Day."
      purpose="The Sales page allows entrepreneurs to quickly record transactions and keep an accurate record of revenue."
      functionality={[
        "Record a new product or service sale.",
        "Enter quantity and selling price.",
        "Automatically calculate the transaction total.",
        "Select the payment method: Cash, Card, or EFT.",
        "View the complete sales history.",
        "Search and filter recorded sales.",
        "Edit incorrect sales records.",
        "Delete sales with confirmation.",
        "Automatically update total revenue.",
      ]}
    />
  );
};

export default Sales;