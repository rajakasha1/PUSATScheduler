import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

// Component to initialize data
function InitializeApp({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initializeData = async () => {
      try {
        await apiRequest("POST", "/api/init", {});
        console.log("Data initialized successfully");
      } catch (error) {
        console.error("Failed to initialize data:", error);
      }
    };
    
    initializeData();
  }, []);
  
  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InitializeApp>
      <App />
      <Toaster />
    </InitializeApp>
  </QueryClientProvider>
);
