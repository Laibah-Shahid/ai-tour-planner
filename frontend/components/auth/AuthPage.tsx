"use client";

import React, { useState, useEffect } from "react";
import Logo from "@/components/ui/Logo";
import FloatingInput from "@/components/ui/FloatingInput";
import { SIMULATED_DELAY } from "@/config/site";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, User, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { supabase } from "@/lib/utils";

interface AuthPageProps {
  initialMode?: "signin" | "signup";
}

export default function AuthPage({ initialMode = "signin" }: AuthPageProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const toggleMode = (newMode: "signin" | "signup") => {
    setMode(newMode);
    router.replace(newMode === "signin" ? "/signin" : "/signup");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
    setLoading(false);
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider });
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-end text-white px-16 py-8 overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 bg-[url('/auth%20img/mountains_valley_trees_195765_1366x768.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-transparent opacity-90" />

        <div className="relative z-10 max-w-xl">
          <h1 className="text-4xl font-semibold font-heading mb-2 leading-tight">
            Discover the unseen beauty of Pakistan with AI.
          </h1>
          <p className="text-lg text-emerald-100/90 mb-2 leading-relaxed font-light">
            Join thousands of travelers planning their perfect trip to the
            northern areas, historical sites, and beyond.
          </p>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-2 border-emerald-900 overflow-hidden relative bg-emerald-800"
                >
                  <Image
                    src={`/avatars/thumb-${i}.jpg`}
                    alt="User avatar"
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-white">
              <p className="font-bold">Join 10k+ explorers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 md:p-12 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center md:text-left">
            <Logo variant="auth" />
            <p className="text-slate-500 mt-2">
              Plan smarter. Travel safer across Pakistan.
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="w-full grid grid-cols-2 p-1 bg-slate-50 rounded-xl mb-6">
            <button
              onClick={() => toggleMode("signin")}
              className={`text-center py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === "signin"
                  ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-emerald-700 hover:bg-slate-100"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => toggleMode("signup")}
              className={`text-center py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === "signup"
                  ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-emerald-700 hover:bg-slate-100"
              }`}
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {mode === "signin" ? (
                <SignInForm loading={loading} onSubmit={handleSubmit} onOAuthSignIn={handleOAuthSignIn} />
              ) : (
                <SignUpForm loading={loading} onSubmit={handleSubmit} onOAuthSignIn={handleOAuthSignIn} />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="pt-8 text-center text-xs text-slate-400 flex justify-center gap-6">
            <Link
              href="#"
              className="hover:text-emerald-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <Link
              href="#"
              className="hover:text-emerald-600 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignInForm({
  loading,
  onSubmit,
  onOAuthSignIn,
}: {
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onOAuthSignIn: (provider: 'google' | 'github') => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-4">
        <FloatingInput
          id="signin-email"
          label="Email Address"
          type="email"
          icon={<Mail className="h-5 w-5" />}
        />
        <FloatingInput
          id="signin-password"
          label="Password"
          icon={<Lock className="h-5 w-5" />}
          showPasswordToggle
        />
      </div>

      <div className="flex items-center justify-end">
        <Link
          href="#"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Forgot Password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:shadow-emerald-600/30 focus:ring-4 focus:ring-emerald-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <span>Sign In</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {/* Visual Divider */}
      <div className="relative mt-6 mb-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500 font-medium">Or continue with</span>
        </div>
      </div>

      {/* OAuth Buttons Row */}
      <div className="flex flex-row gap-3">
        <button
          type="button"
          onClick={() => onOAuthSignIn('google')}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl py-2.5 px-4 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium text-slate-700"
          disabled={loading}
        >
          <img src="/images/google.svg" alt="Google" className="w-5 h-5" />
          <span>Google</span>
        </button>
      </div>
    </form>
  );
}

function SignUpForm({
  loading,
  onSubmit,
  onOAuthSignIn,
}: {
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onOAuthSignIn: (provider: 'google' | 'github') => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-3">
        <FloatingInput
          id="signup-name"
          label="Full Name"
          icon={<User className="h-5 w-5" />}
        />
        <FloatingInput
          id="signup-email"
          label="Email Address"
          type="email"
          icon={<Mail className="h-5 w-5" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FloatingInput
            id="signup-password"
            label="Password"
            icon={<Lock className="h-5 w-5" />}
            showPasswordToggle
          />
          <FloatingInput
            id="signup-confirm"
            label="Confirm"
            icon={<CheckCircle2 className="h-5 w-5" />}
            showPasswordToggle
          />
        </div>
      </div>

      <div className="flex items-start pt-1">
        <div className="flex items-center h-5">
          <input
            id="privacy"
            name="privacy"
            type="checkbox"
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="privacy" className="text-slate-500">
            I agree to the{" "}
            <a
              href="#"
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              Privacy Policy
            </a>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:shadow-emerald-600/30 focus:ring-4 focus:ring-emerald-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <span>Create Account</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {/* Visual Divider */}
      <div className="relative mt-6 mb-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500 font-medium">Or continue with</span>
        </div>
      </div>

      {/* OAuth Buttons Row */}
      <div className="flex flex-row gap-3">
        <button
          type="button"
          onClick={() => onOAuthSignIn('google')}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl py-2.5 px-4 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium text-slate-700"
          disabled={loading}
        >
          <img src="/images/google.svg" alt="Google" className="w-5 h-5" />
          <span>Google</span>
        </button>
      </div>
        
    </form>
  );
}