import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { BriefcaseBusiness } from "lucide-react";
import { Button } from "../components/Button";
import { Field, SelectField } from "../components/Field";
import { ApiError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

export const LoginPage = () => {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("sales");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (mode === "register" && name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to continue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-8 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-lg bg-white p-7 shadow-sm dark:bg-slate-900">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-brand-600 text-white">
            <BriefcaseBusiness size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">GigFlow</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Smart Leads Dashboard</p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-md bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`h-9 rounded text-sm font-medium ${mode === "login" ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`h-9 rounded text-sm font-medium ${mode === "register" ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
          >
            Register
          </button>
        </div>

        {error ? <div className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

        <form className="space-y-4" onSubmit={submit}>
          {mode === "register" ? <Field label="Name" value={name} onChange={(event) => setName(event.target.value)} /> : null}
          <Field label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Field label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {mode === "register" ? (
            <SelectField label="Role" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              <option value="sales">Sales User</option>
              <option value="admin">Admin</option>
            </SelectField>
          ) : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </Button>
        </form>
      </section>
    </main>
  );
};
