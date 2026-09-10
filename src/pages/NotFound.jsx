import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-spark-neutral px-6">
      <div className="text-center">
        <div className="text-7xl font-black text-spark-primary">404</div>

        <h1 className="mt-4 text-2xl font-bold text-spark-primary">
          Page not found
        </h1>

        <p className="mt-2 text-gray-600">
          The page you're looking for doesn't exist.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-spark-primary px-5 py-3 font-semibold text-white"
        >
          <ArrowLeft size={18} />
          Back to SparkSales
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
