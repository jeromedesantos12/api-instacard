"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { getMe, setBootstrapped } from "@/stores/auth.slice";

function onAuthPage() {
  if (typeof window === "undefined") return false;
  const p = window.location.pathname;
  return p === "/login" || p === "/register" || p === "/forgot-password";
}

export function useBootstrapAuth() {
  const dispatch = useAppDispatch();
  const bootstrapped = useAppSelector((s) => s.auth.bootstrapped);

  useEffect(() => {
    if (onAuthPage()) return;
    if (!bootstrapped) {
      dispatch(getMe());
      dispatch(setBootstrapped(true));
    }
  }, [bootstrapped, dispatch]);
}
