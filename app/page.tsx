"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import AuthPage from "./features/auth/auth_page";
import QRSection from "./features/qr_page/qr_section";

type Profile = {
  firstName: string;
  lastName: string;
  studentId: string;
};

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const profile: Profile | null = useMemo(() => {
    if (!user) return null;
    const meta = user.user_metadata ?? {};
    return {
      firstName:
        (meta.first_name as string) ||
        (meta.firstName as string) ||
        (meta.fullName as string) ||
        "",
      lastName:
        (meta.last_name as string) ||
        (meta.lastName as string) ||
        (meta.full_name as string)?.toString().split(" ").slice(1).join(" ") ||
        "",
      studentId:
        (meta.studentId as string) || (meta.student_id as string) || "",
    };
  }, [user]);

  const fullNameDisplay = useMemo(() => {
    if (!user) return "Student";
    const meta = user.user_metadata ?? {};
    const displayMeta =
      (meta.full_name as string) ||
      (meta.fullName as string) ||
      (meta.name as string) ||
      (meta.display_name as string) ||
      "";
    const combinedProfile = profile
      ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
      : "";
    const emailName = user.email?.split("@")[0] ?? "";
    return displayMeta || combinedProfile || emailName || "Student";
  }, [user, profile]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const showDashboard = Boolean(session && user);

  return (
    <div className="min-h-screen bg-[#faf5f5] flex items-center justify-center px-4 py-6">
      <main className="w-full max-w-5xl rounded-3xl bg-white shadow-lg border border-[#e8e8e8] overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <AuthPage
            session={session}
            user={user}
            profile={profile}
            fullNameDisplay={fullNameDisplay}
            onLogout={handleLogout}
            loading={loading}
          />
          <QRSection
            user={user}
            profile={profile}
            showDashboard={showDashboard}
            onLogout={handleLogout}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
}
