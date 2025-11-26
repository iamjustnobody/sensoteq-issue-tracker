import { Toaster as HotToaster } from "react-hot-toast";

export const Toaster: React.FC = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#fff",
          color: "#374151",
          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          borderRadius: "0.75rem",
          padding: "0.75rem 1rem",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
      }}
    />
  );
};
