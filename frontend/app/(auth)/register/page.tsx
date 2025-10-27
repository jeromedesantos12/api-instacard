"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { RegisterSchema, RegisterValues } from "@/shemas/auth.schema";
import { registerRequest } from "@/services/auth.services";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      full_name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: RegisterValues) => {
    try {
      await registerRequest({
        name: values.full_name,
        username: values.username,
        email: values.email,
        password: values.password,
      });
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch (e: any) {
      toast.error(e?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      {/* Left: Image */}
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

      {/* Right: Form */}
      <div className="flex flex-col h-full p-6 md:p-10">
        <div className="flex-1 w-full flex items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight">
                Create account
              </h1>
              <p className="text-sm text-muted-foreground">
                Start your journey and manage your boards with ease.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                {/* Full name */}
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="john_doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
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
                            placeholder="••••••••••••••••"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="••••••••••••••••"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
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
                      Creating account…
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>

                <Separator />

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Sign in
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
