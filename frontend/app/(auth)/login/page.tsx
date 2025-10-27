"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { useAppDispatch } from "@/stores/hooks";
// Ganti: pakai thunk login baru (tanpa verify)
import { login } from "@/stores/auth.slice";

import { LoginSchema, type LoginValues } from "@/shemas/auth.schema";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { emailOrUsername: "", password: "" },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      await dispatch(login(values)).unwrap();
      toast.success("Welcome back 👋");
      const redirect = search.get("redirect");
      router.replace(
        redirect && redirect.startsWith("/") ? redirect : "/dashboard"
      );
    } catch (e) {
      const msg =
        typeof e === "string" ? e : (e as any)?.message || "Login failed";
      toast.error(msg);
    }
  };

  const { isSubmitting, isValid } = form.formState;

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      <div className="relative hidden md:block">
        <Image
          src="https://images.unsplash.com/photo-1628431668031-6e3db588c9e3?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0"
          alt="Workspace illustration"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/20 to-background/60" />
      </div>

      <div className="flex flex-col h-full p-6 md:p-10">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-3xl mb-2 font-semibold tracking-tight">
                Sign in to Insta<span className="text-primary">Card</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Continue to your board and manage your links with ease.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
                <FormField
                  control={form.control}
                  name="emailOrUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email or Username</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="you@example.com or username"
                          autoComplete="username"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••••••"
                            autoComplete="current-password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute inset-y-0 right-2 grid place-items-center px-2 text-muted-foreground hover:text-foreground"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <Separator />

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Create one
                  </Link>
                </p>
              </form>
            </Form>
          </div>
        </div>

        <div className="mt-8 text-xs text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Instacard App</p>
        </div>
      </div>
    </div>
  );
}
