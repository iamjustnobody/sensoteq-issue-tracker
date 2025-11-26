import React from "react";
import { Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/index.js";
import { ROUTES } from "../config/routes.js";

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <AlertCircle size={64} className="text-gray-300 mb-4" />
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-xl text-gray-600 mb-6">Page not found</p>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to={ROUTES.HOME}>
        <Button>
          <Home size={18} className="mr-2" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
