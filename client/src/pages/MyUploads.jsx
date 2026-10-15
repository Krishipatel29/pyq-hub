import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import api, { errorMessage } from "../api/axios";
import { Spinner, EmptyState, ErrorBox, StatusBadge } from "../components/Common";
import { paperTitle, subjectLabel, timeAgo } from "../utils/format";

export default function MyUploads() {
  const [papers, setPapers] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/papers/mine")
      .then((res) => setPapers(res.data.papers))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const live = papers?.filter((p) => p.status === "approved").length || 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">My uploads</h1>
          {papers?.length > 0 && (
            <p className="mt-2 text-pencil">
              {live} of {papers.length} {papers.length === 1 ? "paper" : "papers"} live and helping other students.
            </p>
          )}
        </div>
        <Link to="/upload" className="btn-primary">
          <Upload size={17} /> Upload paper
        </Link>
      </div>

      <div className="mt-8">
        {error && <ErrorBox message={error} />}
        {!papers && !error && <Spinner />}
        {papers && !papers.length && (
          <EmptyState title="You haven't uploaded anything yet">
            Papers you upload show up here with their review status.
          </EmptyState>
        )}
        {papers?.length > 0 && (
          <ul className="panel divide-y divide-rule">
            {papers.map((p) => (
              <li key={p._id}>
                <Link to={`/papers/${p._id}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 hover:bg-sheet">
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-semibold">{subjectLabel(p.subject)}</span>
                    <span className="block text-sm text-pencil">
                      {paperTitle(p)}, uploaded {timeAgo(p.createdAt)}
                    </span>
                    {p.status === "rejected" && p.rejectReason && (
                      <span className="mt-1 block text-sm text-redpen">{p.rejectReason}</span>
                    )}
                  </span>
                  <StatusBadge status={p.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
