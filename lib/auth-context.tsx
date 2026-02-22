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

  const fetchProfile = async (userId: string, retries = 2) => {
    const withTimeout = (promise: Promise<any>, ms: number) =>
      Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))]);

    for (let i = 0; i < retries; i++) {
      console.log(`Fetching profile (attempt ${i + 1}/${retries}) for:`, userId);
      try {
        const query = supabase.from("profiles").select("*").eq("id", userId).single();
        const { data, error } = await withTimeout(Promise.resolve(query), 3000) as any;

        if (error) {
          console.warn(`Profile fetch attempt ${i + 1} failed:`, error.message);
          if (i < retries - 1) await new Promise(res => setTimeout(res, 1000));
          continue;
        }

        if (data) {
          console.log("✅ Profile loaded:", data.nickname);
          setProfile(data as Profile);
          return;
        }
      } catch (err) {
        console.warn(`Profile fetch error (attempt ${i + 1}):`, err);
        if (i < retries - 1) await new Promise(res => setTimeout(res, 1000));
      }
    }
    console.warn("❌ Failed to fetch profile after retries.");
  };

  useEffect(() => {
    const initAuth = async () => {
      console.log("Starting Auth initialization...");
      const safetyHandle = setTimeout(() => {
        setIsReady(true);
      }, 5000);

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          setUser(session.user);
          // 프로필 로딩은 병렬로 처리하여 준비 상태를 늦추지 않음
          fetchProfile(session.user.id);
        }
      } catch (err) {
        console.warn("Auth init error:", err);
      } finally {
        clearTimeout(safetyHandle);
        setIsReady(true);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth Event:", event);
        try {
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
            setIsGuest(false);
          } else if (event === "SIGNED_OUT") {
            setProfile(null);
          }
        } catch (err) {
          console.error("Auth state change error:", err);
        } finally {
          setIsReady(true);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("Aggressive signing out started...");
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("SignOut failed, clearing manually:", e);
    } finally {
      setUser(null);
      setProfile(null);
      setIsGuest(false);

      if (typeof window !== "undefined") {
        localStorage.removeItem("sb-modam-session-v4-auth-token");
        Object.keys(localStorage).forEach(key => {
          if (key.includes("modam-session") || key.includes("modam-auth") || key.includes("supabase.auth.token")) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
        console.log("Logged out and redirecting...");
        window.location.href = "/";
      }
    }
  };

  const enterAsGuest = () => {
    setIsGuest(true);
    setIsReady(true);
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
