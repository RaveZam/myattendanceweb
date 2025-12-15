"use client";

import { useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabaseClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type AuthMode = "login" | "register";

type Profile = {
  firstName: string;
  lastName: string;
  studentId: string;
};

type AuthPageProps = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  fullNameDisplay: string;
  onLogout: () => Promise<void>;
  loading: boolean;
};

export default function AuthPage({
  session,
  user,
  profile,
  fullNameDisplay,
  onLogout,
  loading: parentLoading,
}: AuthPageProps) {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      if (authMode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError("Unable to log in. Please check your credentials.");
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              student_id: studentId,
            },
          },
        });
        if (signUpError) {
          setError("Unable to register. Please try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const showDashboard = Boolean(session && user);

  return (
    <section className="md:w-1/2 bg-white px-8 py-8 md:py-10 border-b md:border-b-0 md:border-r border-[#e8e8e8]">
      {!showDashboard ? (
        <div>
          <div className="inline-flex rounded-full bg-[#f0f0f0] p-1 mb-6">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`px-4 py-1 text-sm rounded-full transition-colors ${
                authMode === "login"
                  ? "bg-[#6A0F0F] text-white shadow-sm hover:bg-[#5A0D0D]"
                  : "text-[#4b5563]"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className={`px-4 py-1 text-sm rounded-full transition-colors ${
                authMode === "register"
                  ? "bg-[#6A0F0F] text-white shadow-sm hover:bg-[#5A0D0D]"
                  : "text-[#4b5563]"
              }`}
            >
              Register
            </button>
          </div>

          <h2 className="text-xl font-semibold text-[#111827] mb-2">
            {authMode === "login"
              ? "Welcome back, student"
              : "Create your student account"}
          </h2>
          <p className="text-sm text-[#4b5563] mb-6">
            Use your school email and a secure password. After sign in, your QR
            code will be ready for attendance.
          </p>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleAuth();
            }}
          >
            {authMode === "register" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-[#374151] mb-1"
                    >
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#111827] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6A0F0F]/70 focus:border-transparent"
                      placeholder="e.g. Jane"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-[#374151] mb-1"
                    >
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#111827] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6A0F0F]/70 focus:border-transparent"
                      placeholder="e.g. Doe"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="studentId"
                    className="block text-sm font-medium text-[#374151] mb-1"
                  >
                    Student ID
                  </label>
                  <input
                    id="studentId"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#111827] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6A0F0F]/70 focus:border-transparent"
                    placeholder="e.g. 24-3017"
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#374151] mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6A0F0F]/70 focus:border-transparent"
                placeholder="you@gmail.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#374151] mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={
                  authMode === "login" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6A0F0F]/70 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-[#b91c1c] bg-[#fee2e2] border border-[#fecaca] rounded-2xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-[#6A0F0F] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#6A0F0F]/30 hover:bg-[#5A0D0D] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? "Please wait..."
                : authMode === "login"
                ? "Login"
                : "Register"}
            </button>
          </form>
        </div>
      ) : (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280] mb-2">
            Student details
          </p>
          <h2 className="text-xl font-semibold text-[#111827] mb-4">
            Welcome, {fullNameDisplay}
          </h2>
          <div className="space-y-3 text-sm text-[#4b5a63]">
            <div>
              <p className="text-xs font-medium text-[#6b7280] uppercase">
                Name
              </p>
              <p className="rounded-xl bg-[#fef7f5] border border-[#f0e0dc] px-3 py-2 mt-1">
                {fullNameDisplay || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6b7280] uppercase">
                Student ID
              </p>
              <p className="rounded-xl bg-[#fef7f5] border border-[#f0e0dc] px-3 py-2 mt-1">
                {profile?.studentId || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6b7280] uppercase">
                Email
              </p>
              <p className="rounded-xl bg-[#fef7f5] border border-[#f0e0dc] px-3 py-2 mt-1">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  disabled={parentLoading}
                  className="w-full text-sm rounded-full bg-[#6A0F0F] text-white px-4 py-2 shadow-md shadow-[#6A0F0F]/30 hover:bg-[#5A0D0D] transition-colors disabled:opacity-50"
                >
                  Sign out
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to sign out? You will need to sign in
                    again to access your attendance QR code.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onLogout}
                    disabled={parentLoading}
                    className="bg-[#6A0F0F] text-white hover:bg-[#5A0D0D] shadow-md shadow-[#6A0F0F]/30"
                  >
                    {parentLoading ? "Signing out..." : "Sign out"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </section>
  );
}
