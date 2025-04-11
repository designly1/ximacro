import React from "react";
import { createRoot } from "react-dom/client";
import Layout from "@/layout/layout";
import { AppProvider } from "@/contexts/app-provider";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}
const root = createRoot(rootElement);

root.render(
  <AppProvider>
    <Layout />
  </AppProvider>
);
