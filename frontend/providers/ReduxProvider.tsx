"use client";

import { Provider } from "react-redux";
import { store } from "@/stores";
import { useBootstrapAuth } from "@/hooks/useAuthBootstrap";

function Bootstrap() {
  useBootstrapAuth();
  return null;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <Bootstrap />
      {children}
    </Provider>
  );
}
