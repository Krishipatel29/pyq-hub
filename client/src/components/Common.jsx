import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Spinner({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-pencil" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-rule border-t-ballpoint" />
      {label}
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="panel ruled flex flex-col items-center px-6 py-14 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children && <p className="mt-1 max-w-md text-pencil">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-redpen/30 bg-redpen-soft px-5 py-4 text-redpen">
      {message}
      {onRetry && (
        <button onClick={onRetry} className="ml-3 font-bold underline underline-offset-2">
          Try again
        </button>
      )}
    </div>
  );
}

// years shown as small stamps, e.g. 2022 2023 2024
export function YearStamps({ years, size = "md" }) {
  const cls = size === "sm" ? "px-1.5 py-0 text-xs" : "px-2 py-0.5 text-sm";
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {years.map((y) => (
        <span key={y} className={`rounded border border-ballpoint/30 font-display font-semibold text-ballpoint ${cls}`}>
          {y}
        </span>
      ))}
    </span>
  );
}

const STATUS_STYLE = {
  pending: "bg-highlight-soft text-[#7a6200]",
  approved: "bg-tick-soft text-tick",
  rejected: "bg-redpen-soft text-redpen",
};

const STATUS_TEXT = { pending: "Waiting for review", approved: "Live", rejected: "Rejected" };

export function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${STATUS_STYLE[status]}`}>
      {STATUS_TEXT[status]}
    </span>
  );
}

export function RequireAuth({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
