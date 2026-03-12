"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/utils";
import FloatingInput from "@/components/ui/FloatingInput";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSuccess(false);
    if (!password || password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setMsg("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setMsg(error.message);
    } else {
      setSuccess(true);
      setMsg("Password updated! You can now sign in.");
      redirectTimeoutRef.current = setTimeout(() => router.push("/signin"), 2000);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
      <form onSubmit={handleReset} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6 border border-emerald-100">
        <h2 className="text-2xl font-bold text-emerald-900 mb-2 text-center">Set New Password</h2>
        <FloatingInput
          id="reset-password"
          label="New Password"
          type="password"
          icon={<Lock className="h-5 w-5" />}
          value={password}
          onChange={e => setPassword(e.target.value)}
          showPasswordToggle
          required
        />
        <FloatingInput
          id="reset-confirm"
          label="Confirm Password"
          type="password"
          icon={<CheckCircle2 className="h-5 w-5" />}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          showPasswordToggle
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all focus:ring-4 focus:ring-emerald-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Update Password</span>}
        </button>
        {msg && (
          <div className={`text-center text-sm mt-2 ${success ? "text-emerald-700" : "text-red-600"}`}>{msg}</div>
        )}
      </form>
    </div>
  );
}
