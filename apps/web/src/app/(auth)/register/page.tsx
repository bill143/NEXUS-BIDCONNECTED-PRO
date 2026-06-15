"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Building,
} from "lucide-react";

interface FieldError {
  field: string;
  message: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const errors: FieldError[] = [];

    if (!firstName.trim()) {
      errors.push({ field: "firstName", message: "First name is required." });
    }
    if (!lastName.trim()) {
      errors.push({ field: "lastName", message: "Last name is required." });
    }
    if (!email.trim()) {
      errors.push({ field: "email", message: "Email is required." });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: "email", message: "Enter a valid email address." });    }
    if (!companyName.trim()) {
      errors.push({
        field: "companyName",
        message: "Company name is required.",
      });
    }
    if (!password) {
      errors.push({ field: "password", message: "Password is required." });
    } else if (password.length < 8) {
      errors.push({
        field: "password",
        message: "Password must be at least 8 characters.",
      });
    }
    if (password !== confirmPassword) {
      errors.push({
        field: "confirmPassword",
        message: "Passwords do not match.",
      });
    }

    setFieldErrors(errors);
    return errors.length === 0;
  }
  function getFieldError(field: string): string | undefined {
    return fieldErrors.find((e) => e.field === field)?.message;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors([]);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          companyName: companyName.trim(),
          password,
        }),      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.url) {
        router.push(result.url);
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-lg font-semibold text-slate-100">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Get started with BidConnect Pro
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="animate-slide-in-top rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label              htmlFor="firstName"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                autoComplete="given-name"
                autoFocus
                disabled={isLoading}
                className="h-10 w-full rounded-lg border border-slate-800 bg-slate-800/50 pl-10 pr-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 disabled:opacity-60"
              />
            </div>
            {getFieldError("firstName") && (
              <p className="mt-1 text-xs text-red-400">
                {getFieldError("firstName")}
              </p>
            )}
          </div>          <div>
            <label
              htmlFor="lastName"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              autoComplete="family-name"
              disabled={isLoading}
              className="h-10 w-full rounded-lg border border-slate-800 bg-slate-800/50 px-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 disabled:opacity-60"
            />
            {getFieldError("lastName") && (
              <p className="mt-1 text-xs text-red-400">
                {getFieldError("lastName")}
              </p>
            )}
          </div>
        </div>
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              disabled={isLoading}
              className="h-10 w-full rounded-lg border border-slate-800 bg-slate-800/50 pl-10 pr-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 disabled:opacity-60"
            />
          </div>
          {getFieldError("email") && (
            <p className="mt-1 text-xs text-red-400">
              {getFieldError("email")}            </p>
          )}
        </div>

        {/* Company Name */}
        <div>
          <label
            htmlFor="companyName"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Company Name
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Construction"
              autoComplete="organization"
              disabled={isLoading}
              className="h-10 w-full rounded-lg border border-slate-800 bg-slate-800/50 pl-10 pr-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 disabled:opacity-60"
            />          </div>
          {getFieldError("companyName") && (
            <p className="mt-1 text-xs text-red-400">
              {getFieldError("companyName")}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"              disabled={isLoading}
              className="h-10 w-full rounded-lg border border-slate-800 bg-slate-800/50 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {getFieldError("password") && (
            <p className="mt-1 text-xs text-red-400">
              {getFieldError("password")}
            </p>
          )}
        </div>

        {/* Confirm Password */}        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              disabled={isLoading}
              className="h-10 w-full rounded-lg border border-slate-800 bg-slate-800/50 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
              tabIndex={-1}
              aria-label={                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {getFieldError("confirmPassword") && (
            <p className="mt-1 text-xs text-red-400">
              {getFieldError("confirmPassword")}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary h-10 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-sky-500 hover:text-sky-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}