"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import type { User as AuthUser } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  username: string;
  nickname: string;
  full_name: string;
  phone_number: string;
  user_role: "user" | "expert" | "owner";
  signup_path?: string;
  address?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isReady: boolean;
  isGuest: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  enterAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  useEffect(() => {
    // 세션 유지 시 게스트 모드 해제
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setIsReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
          setIsGuest(false); // 실제 로그인 시 게스트 모드 종료
        } else {
          setProfile(null);
        }
        setIsReady(true);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsGuest(false);
  };

  const enterAsGuest = () => {
    setIsGuest(true);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isReady, isGuest, signOut, refreshProfile, enterAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
