
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AuthPage: React.FC = () => {
  const [view, setView] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Redirect logged-in users to the homepage automatically
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        navigate("/", { replace: true });
      }
    });
  }, [navigate]);

  // Update 'username' field in 'profiles' for this user
  const updateProfileUsername = async (userId: string, email: string) => {
    if (!userId || !email) return;
    // Only update if username is not set or is blank
    await supabase
      .from("profiles")
      .update({ username: email })
      .eq("id", userId);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (view === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Update their profile username after login (self-healing if needed)
        if (data?.user?.id) {
          await updateProfileUsername(data.user.id, email);
        }
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (error) throw error;
        // On initial signup, try to set username (may fail if confirmation needed, so it's fine)
        if (data?.user?.id) {
          await updateProfileUsername(data.user.id, email);
        }
        setSuccess(
          "Account created! Please check your email to confirm your address before logging in."
        );
      }
      // Page reload ensures a fully clean state after auth
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.message || "Authentication error");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-lime-100 via-emerald-50 to-yellow-50">
      <div className="bg-white/95 border rounded-2xl shadow-xl px-8 py-8 w-full max-w-md">
        <h2 className="mb-4 text-2xl font-bold text-emerald-800 text-center">
          {view === "login" ? "Login to Your Account" : "Create an Account"}
        </h2>
        {/* Show success message in a nice banner */}
        {success && (
          <div className="mb-3 w-full rounded-lg border border-emerald-400 bg-emerald-50 px-4 py-3 text-emerald-900 font-semibold text-center shadow-sm">
            {success}
          </div>
        )}
        <form className="flex flex-col gap-4" onSubmit={handleAuth}>
          <label>
            <span className="block text-lg text-emerald-900 font-medium mb-1">Email</span>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-lg bg-lime-50 text-emerald-900"
              value={email}
              autoComplete="email"
              disabled={submitting}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            <span className="block text-lg text-emerald-900 font-medium mb-1">Password</span>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg bg-lime-50 text-emerald-900"
              value={password}
              autoComplete={view === "login" ? "current-password" : "new-password"}
              minLength={6}
              disabled={submitting}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && (
            <div className="text-destructive text-sm text-center py-1">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting
              ? view === "login"
                ? "Logging in..."
                : "Creating account..."
              : view === "login"
                ? "Log In"
                : "Sign Up"}
          </Button>
        </form>
        <div className="text-center mt-3">
          {view === "login" ? (
            <>
              <span className="text-muted-foreground mr-1">No account?</span>
              <button
                className="text-emerald-700 font-semibold hover:underline"
                onClick={() => { setView("signup"); setError(null); setSuccess(null); }}
                disabled={submitting}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              <span className="text-muted-foreground mr-1">Already have an account?</span>
              <button
                className="text-emerald-700 font-semibold hover:underline"
                onClick={() => { setView("login"); setError(null); setSuccess(null); }}
                disabled={submitting}
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
