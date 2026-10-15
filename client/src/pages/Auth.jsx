import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/axios";

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="ruled min-h-[calc(100vh-4rem)] px-4 py-14">
      <div className="mx-auto max-w-md">
        <div className="panel p-7 shadow-[0_18px_40px_-28px_rgba(37,71,168,0.5)] sm:p-9">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-pencil">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
        <p className="mt-5 text-center text-pencil">{footer}</p>
      </div>
    </div>
  );
}

function PasswordInput({ id, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        className="input pr-11"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
        minLength={6}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-pencil hover:text-ink"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      toast.success(`Welcome back, ${u.name.split(" ")[0]}`);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Log in"
      subtitle="Save questions for revision and upload papers."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-bold text-ballpoint underline-offset-2 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-redpen-soft px-3 py-2 text-sm text-redpen">{error}</p>}
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
          />
        </div>
        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}

export function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", college: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created");
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Free for every student. Takes a few seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-ballpoint underline-offset-2 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-redpen-soft px-3 py-2 text-sm text-redpen">{error}</p>}
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input id="name" className="input" value={form.name} onChange={set("name")} autoComplete="name" required maxLength={60} />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" className="input" value={form.email} onChange={set("email")} autoComplete="email" required />
        </div>
        <div>
          <label htmlFor="college" className="label">
            College or university <span className="font-normal text-pencil">(optional)</span>
          </label>
          <input id="college" className="input" value={form.college} onChange={set("college")} placeholder="e.g. VNSGU" />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <PasswordInput id="password" value={form.password} onChange={set("password")} autoComplete="new-password" />
          <p className="mt-1.5 text-sm text-pencil">At least 6 characters.</p>
        </div>
        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
