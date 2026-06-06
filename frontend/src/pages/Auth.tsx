import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import axios from "axios";
import { googleTokenLogin, login, signup } from "../services/api";
import { useAppStore } from "../store/useAppStore";

export function Auth({ mode }: { mode: "login" | "signup" }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAppStore((state) => state.setUser);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const from = (location.state as { from?: string } | null)?.from ?? "/detect";

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    function renderGoogleButton() {
      if (!window.google || !googleButtonRef.current) return;
      if (!clientId) {
        setError("Google Client ID is not configured.");
        return;
      }
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setError("");
          setLoading(true);
          try {
            setUser(await googleTokenLogin(response.credential));
            navigate(from);
          } catch (err) {
            const detail = axios.isAxiosError(err) ? err.response?.data?.detail : null;
            setError(detail ? `Google authentication failed: ${detail}` : "Google authentication failed. Please try again.");
          } finally {
            setLoading(false);
          }
        },
      });
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: mode === "login" ? "signin_with" : "signup_with",
        width: 360,
      });
    }

    if (window.google) {
      renderGoogleButton();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);
  }, [from, mode, navigate, setUser]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        setUser(await signup(fullName, email, password));
      } else {
        setUser(await login(email, password));
      }
      navigate(from);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-6 py-16">
      <Card className="w-full">
        <Logo className="justify-center" imageClassName="h-16 w-16 rounded-3xl" />
        <h1 className="mt-8 text-center font-heading text-3xl font-bold">{mode === "login" ? "Login" : "Signup"}</h1>
        <form className="mt-8 grid gap-4" onSubmit={submit}>
          {mode === "signup" ? (
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="rounded-2xl border border-border bg-transparent px-4 py-3" placeholder="Full Name" required />
          ) : null}
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-2xl border border-border bg-transparent px-4 py-3" placeholder="Email" type="email" required />
          <input value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-2xl border border-border bg-transparent px-4 py-3" placeholder="Password" type="password" minLength={8} required />
          {error ? <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</p> : null}
          <Button disabled={loading} type="submit">{loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}</Button>
          <div className="flex justify-center rounded-2xl border border-border bg-white px-3 py-2">
            <div ref={googleButtonRef} />
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          {mode === "login" ? "Need an account? " : "Already registered? "}
          <Link className="text-primary" to={mode === "login" ? "/signup" : "/login"}>{mode === "login" ? "Signup" : "Login"}</Link>
        </p>
      </Card>
    </section>
  );
}
