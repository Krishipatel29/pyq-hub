import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ExternalLink, Trash2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api, { errorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Spinner, ErrorBox, StatusBadge, EmptyState } from "../components/Common";
import QuestionActions from "../components/QuestionActions";
import { EXAM_LABEL, subjectLabel } from "../utils/format";

function FilePreview({ paper }) {
  const [show, setShow] = useState(false);
  if (!paper.fileUrl) return null;

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <p className="font-display font-semibold">Original paper</p>
          <p className="text-sm text-pencil">{paper.fileType === "pdf" ? "PDF file" : "Photo of the paper"}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost py-2" onClick={() => setShow((s) => !s)} aria-expanded={show}>
            {show ? "Hide" : "Show here"}
          </button>
          <a href={paper.fileUrl} target="_blank" rel="noreferrer" className="btn-primary py-2">
            <ExternalLink size={16} /> Open
          </a>
        </div>
      </div>
      {show && (
        <div className="border-t border-rule bg-sheet">
          {paper.fileType === "pdf" ? (
            <iframe src={paper.fileUrl} title="Question paper" className="h-[75vh] w-full" />
          ) : (
            <img src={paper.fileUrl} alt="Question paper" className="mx-auto max-h-[80vh] w-auto" />
          )}
        </div>
      )}
    </div>
  );
}

export default function PaperPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setData(null);
    api
      .get(`/papers/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, [id, user?._id]);

  if (error) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorBox message={error} /></div>;
  if (!data) return <Spinner />;

  const { paper, questions } = data;
  const isOwner = user && String(paper.uploadedBy?._id) === String(user._id);
  const canDelete = user?.role === "admin" || (isOwner && paper.status !== "approved");
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  async function handleDelete() {
    if (!window.confirm("Delete this paper and all its questions? This can't be undone.")) return;
    try {
      await api.delete(`/papers/${paper._id}`);
      toast.success("Paper deleted");
      navigate(paper.status === "approved" ? `/subjects/${paper.subject._id}` : "/my-uploads");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to={`/subjects/${paper.subject._id}`} className="inline-flex items-center gap-1.5 text-sm text-pencil hover:text-ink">
        <ArrowLeft size={16} /> {subjectLabel(paper.subject)}
      </Link>

      <header className="mt-4 border-b-2 border-redpen/40 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              {EXAM_LABEL[paper.examType]} exam, {[paper.month, paper.year].filter(Boolean).join(" ")}
            </h1>
            <p className="mt-2 text-pencil">
              {paper.subject.university} {paper.subject.course}, Semester {paper.subject.semester}
              {paper.uploadedBy?.name && <>, shared by {paper.uploadedBy.name}</>}
            </p>
          </div>
          {canDelete && (
            <button onClick={handleDelete} className="btn-danger py-2">
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>

        {paper.status !== "approved" && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-sheet px-4 py-3">
            <StatusBadge status={paper.status} />
            <span className="text-sm text-pencil">
              {paper.status === "pending"
                ? "Only you and the admins can see this paper until it's reviewed."
                : `Reason: ${paper.rejectReason}`}
            </span>
          </div>
        )}
      </header>

      <div className="mt-6 space-y-6">
        <FilePreview paper={paper} />

        {questions.length ? (
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-xl font-bold">Questions</h2>
              <span className="text-sm text-pencil">
                {questions.length} questions{totalMarks ? `, ${totalMarks} marks` : ""}
              </span>
            </div>
            <ol className="panel divide-y divide-rule">
              {questions.map((q, i) => (
                <li key={q._id} className="flex gap-4 px-5 py-4">
                  <span className="w-8 shrink-0 font-display font-bold text-pencil">Q{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[17px] leading-snug">{q.text}</p>
                    {(q.topic || q.marks > 0) && (
                      <p className="mt-1.5 text-sm text-pencil">
                        {q.topic}
                        {q.topic && q.marks > 0 && ", "}
                        {q.marks > 0 && `${q.marks} marks`}
                      </p>
                    )}
                  </div>
                  {paper.status === "approved" && <QuestionActions question={q} />}
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <EmptyState title="Questions not typed yet">Open the original paper above to read the questions.</EmptyState>
        )}
      </div>
    </div>
  );
}
