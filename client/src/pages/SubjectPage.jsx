import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronDown, ChevronRight, FileText, Upload, Eye } from "lucide-react";
import api, { errorMessage } from "../api/axios";
import { Spinner, EmptyState, ErrorBox, YearStamps } from "../components/Common";
import QuestionActions from "../components/QuestionActions";
import { EXAM_LABEL } from "../utils/format";

function timesText(n) {
  if (n === 2) return "asked twice";
  return `asked ${n} times`;
}

function RepeatedQuestion({ item, rank }) {
  const [open, setOpen] = useState(false);
  const strong = item.years.length >= 3;

  return (
    <li className="px-5 py-5 sm:px-6">
      <div className="flex gap-4">
        <span className="w-6 shrink-0 pt-0.5 text-right font-display text-lg font-bold text-pencil">{rank}</span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold leading-snug">
            <span className={strong ? "marker" : ""}>{item.text}</span>
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-pencil">
            <YearStamps years={item.years} size="sm" />
            <span>{timesText(item.timesAsked)}</span>
            {item.topic && <span className="rounded bg-sheet px-2 py-0.5">{item.topic}</span>}
            {item.marks > 0 && <span>up to {item.marks} marks</span>}
          </div>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-ballpoint"
          >
            <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            {open ? "Hide" : "See"} how it was worded each time
          </button>

          {open && (
            <ul className="mt-3 space-y-2 border-l-2 border-highlight pl-4">
              {item.variants.map((v) => (
                <li key={v._id} className="text-[15px]">
                  <Link to={`/papers/${v.paperId}`} className="hover:text-ballpoint">
                    <span className="mr-2 font-display font-semibold text-ballpoint">
                      {v.year} {EXAM_LABEL[v.examType]}
                    </span>
                    {v.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <QuestionActions question={{ _id: item._id }} showUpvote={false} />
      </div>
    </li>
  );
}

function RepeatedTab({ subjectId }) {
  const [minYears, setMinYears] = useState(2);
  const [topic, setTopic] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setData(null);
    setError("");
    api
      .get(`/subjects/${subjectId}/important`, { params: { minYears } })
      .then((res) => setData(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, [subjectId, minYears]);

  const topics = useMemo(
    () => [...new Set((data?.important || []).map((q) => q.topic).filter(Boolean))].sort(),
    [data]
  );
  const list = (data?.important || []).filter((q) => !topic || q.topic === topic);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Spinner label="Comparing papers" />;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-pencil">
          Compared {data.totalQuestions} questions. Questions highlighted in yellow came in 3 or more years.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-pencil">Show questions asked in</span>
          <select className="input w-auto py-1.5" value={minYears} onChange={(e) => setMinYears(Number(e.target.value))}>
            <option value={2}>2+ years</option>
            <option value={3}>3+ years</option>
            <option value={1}>any year</option>
          </select>
        </label>
      </div>

      {topics.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
          {["", ...topics].map((t) => (
            <button
              key={t || "all"}
              onClick={() => setTopic(t)}
              aria-pressed={topic === t}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                topic === t ? "border-ink bg-ink text-white" : "border-rule bg-paper text-pencil hover:text-ink"
              }`}
            >
              {t || "All topics"}
            </button>
          ))}
        </div>
      )}

      {list.length ? (
        <ol className="panel divide-y divide-rule">
          {list.map((item, i) => (
            <RepeatedQuestion key={item._id} item={item} rank={i + 1} />
          ))}
        </ol>
      ) : (
        <EmptyState title="No repeated questions yet">
          Repeats show up once papers from at least two different years are uploaded for this subject.
        </EmptyState>
      )}
    </div>
  );
}

function PapersTab({ papers }) {
  const byYear = useMemo(() => {
    const map = new Map();
    papers.forEach((p) => {
      if (!map.has(p.year)) map.set(p.year, []);
      map.get(p.year).push(p);
    });
    return [...map.entries()];
  }, [papers]);

  if (!papers.length) {
    return (
      <EmptyState
        title="No papers for this subject yet"
        action={
          <Link to="/upload" className="btn-primary">
            <Upload size={17} /> Upload the first paper
          </Link>
        }
      >
        Have an old paper on your phone? Upload it and help your juniors.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      {byYear.map(([year, list]) => (
        <section key={year} className="grid gap-3 sm:grid-cols-[80px_1fr]">
          <h3 className="font-display text-2xl font-bold text-ballpoint sm:pt-3">{year}</h3>
          <ul className="panel divide-y divide-rule">
            {list.map((p) => (
              <li key={p._id}>
                <Link to={`/papers/${p._id}`} className="group flex items-center gap-4 px-5 py-4 hover:bg-sheet">
                  <FileText className="shrink-0 text-pencil" size={20} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-semibold">
                      {EXAM_LABEL[p.examType]} exam{p.month ? `, ${p.month} ${p.year}` : ""}
                    </span>
                    <span className="block text-sm text-pencil">
                      {p.questionCount} questions{p.fileUrl ? ", original paper attached" : ""}
                    </span>
                  </span>
                  <span className="hidden items-center gap-1 text-sm text-pencil sm:flex" title="Views">
                    <Eye size={15} /> {p.views}
                  </span>
                  <ChevronRight size={20} className="text-pencil" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default function SubjectPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("repeated");

  useEffect(() => {
    setData(null);
    api
      .get(`/subjects/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  if (error) return <div className="mx-auto max-w-4xl px-4 py-10"><ErrorBox message={error} /></div>;
  if (!data) return <Spinner />;

  const { subject, papers } = data;

  const tabClass = (t) =>
    `-mb-px border-b-2 px-1 pb-3 font-display text-[17px] font-semibold transition-colors ${
      tab === t ? "border-ballpoint text-ink" : "border-transparent text-pencil hover:text-ink"
    }`;

  return (
    <div>
      <section className="border-b border-rule bg-paper">
        <div className="mx-auto max-w-4xl px-4 pt-10">
          <Link to="/" className="text-sm text-pencil hover:text-ink">
            {subject.university} {subject.course}, Semester {subject.semester}
          </Link>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-4xl font-bold sm:text-5xl">
              {subject.code && <span className="mr-3 text-ballpoint">{subject.code}</span>}
              {subject.name}
            </h1>
            <Link to="/upload" state={{ subjectId: subject._id }} className="btn-ghost">
              <Upload size={17} /> Add a paper
            </Link>
          </div>

          <div className="mt-8 flex gap-6" role="tablist">
            <button role="tab" aria-selected={tab === "repeated"} className={tabClass("repeated")} onClick={() => setTab("repeated")}>
              Most repeated
            </button>
            <button role="tab" aria-selected={tab === "papers"} className={tabClass("papers")} onClick={() => setTab("papers")}>
              All papers ({papers.length})
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {tab === "repeated" ? <RepeatedTab subjectId={subject._id} /> : <PapersTab papers={papers} />}
      </div>
    </div>
  );
}
