import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import api, { errorMessage } from "../api/axios";
import { Spinner, EmptyState, ErrorBox } from "../components/Common";
import { paperTitle, subjectLabel, timeAgo } from "../utils/format";

const TABS = [
  { key: "pending", label: "Waiting" },
  { key: "approved", label: "Live" },
  { key: "rejected", label: "Rejected" },
];

function ReviewRow({ paper, onDone }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function update(status) {
    if (status === "rejected" && !reason.trim()) return toast.error("Write a reason so the student knows what to fix");
    setBusy(true);
    try {
      await api.patch(`/admin/papers/${paper._id}/status`, { status, rejectReason: reason });
      toast.success(status === "approved" ? "Paper is live" : "Paper rejected");
      onDone(paper._id);
    } catch (err) {
      toast.error(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <li className="px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to={`/papers/${paper._id}`} className="font-display text-lg font-semibold hover:text-ballpoint">
            {subjectLabel(paper.subject)}
          </Link>
          <p className="text-sm text-pencil">
            {paper.subject?.course} Sem {paper.subject?.semester}, {paperTitle(paper)}
          </p>
          <p className="mt-1 text-sm text-pencil">
            {paper.questionCount} questions{paper.fileUrl ? " and a file" : ", no file"}. From {paper.uploadedBy?.name} (
            {paper.uploadedBy?.email}), {timeAgo(paper.createdAt)}
          </p>
          {paper.rejectReason && <p className="mt-1 text-sm text-redpen">Reason: {paper.rejectReason}</p>}
        </div>

        <div className="flex gap-2">
          {paper.fileUrl && (
            <a href={paper.fileUrl} target="_blank" rel="noreferrer" className="btn-ghost py-2" aria-label="Open file">
              <ExternalLink size={16} />
            </a>
          )}
          {paper.status !== "approved" && (
            <button onClick={() => update("approved")} disabled={busy} className="btn py-2 bg-tick text-white hover:bg-tick/90">
              <Check size={17} /> Approve
            </button>
          )}
          {paper.status !== "rejected" && !rejecting && (
            <button onClick={() => setRejecting(true)} disabled={busy} className="btn-danger py-2">
              <X size={17} /> Reject
            </button>
          )}
        </div>
      </div>

      {rejecting && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label htmlFor={`reason-${paper._id}`} className="sr-only">Reason for rejecting</label>
          <input
            id={`reason-${paper._id}`}
            className="input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Photo is blurry, please upload a clearer one"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={() => update("rejected")} disabled={busy} className="btn py-2 bg-redpen text-white hover:bg-redpen/90">
              Reject paper
            </button>
            <button onClick={() => setRejecting(false)} className="btn-ghost py-2">Cancel</button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState("pending");
  const [stats, setStats] = useState(null);
  const [papers, setPapers] = useState(null);
  const [error, setError] = useState("");

  const loadStats = useCallback(() => {
    api.get("/admin/stats").then((res) => setStats(res.data)).catch(() => {});
  }, []);

  useEffect(loadStats, [loadStats]);

  useEffect(() => {
    setPapers(null);
    setError("");
    api
      .get("/admin/papers", { params: { status: tab } })
      .then((res) => setPapers(res.data.papers))
      .catch((err) => setError(errorMessage(err)));
  }, [tab]);

  function handleDone(id) {
    setPapers((ps) => ps.filter((p) => p._id !== id));
    loadStats();
  }

  const countFor = { pending: stats?.pending, approved: stats?.approved, rejected: stats?.rejected };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl font-bold">Review queue</h1>
      {stats && (
        <p className="mt-2 text-pencil">
          {stats.users} students, {stats.subjects} subjects and {stats.questions} live questions on PYQ Hub.
        </p>
      )}

      <div className="mt-8 flex gap-2" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-4 py-1.5 font-display font-semibold transition-colors ${
              tab === t.key ? "border-ink bg-ink text-white" : "border-rule bg-paper text-pencil hover:text-ink"
            }`}
          >
            {t.label}
            {countFor[t.key] !== undefined && <span className="ml-1.5 opacity-70">{countFor[t.key]}</span>}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {error && <ErrorBox message={error} />}
        {!papers && !error && <Spinner />}
        {papers && !papers.length && (
          <EmptyState title={tab === "pending" ? "All caught up" : "Nothing here"}>
            {tab === "pending" ? "New uploads from students will appear here for review." : null}
          </EmptyState>
        )}
        {papers?.length > 0 && (
          <ul className="panel divide-y divide-rule">
            {papers.map((p) => (
              <ReviewRow key={p._id} paper={p} onDone={handleDone} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
