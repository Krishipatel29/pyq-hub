import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight, FileText } from "lucide-react";
import api, { errorMessage } from "../api/axios";
import { Spinner, EmptyState, ErrorBox, YearStamps } from "../components/Common";
import { paperTitle, subjectLabel, timeAgo } from "../utils/format";

function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function Hero({ query, setQuery, stats }) {
  return (
    <section className="ruled overflow-hidden border-b border-rule bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.15fr_1fr] md:items-center md:py-20">
        <div>
          <h1 className="text-[2.4rem] font-bold leading-[1.05] sm:text-6xl">
            Study the questions that keep coming back.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-pencil">
            Previous year papers for every subject, in one place. PYQ Hub compares them year by year and
            shows which questions your university repeats.
          </p>

          <label htmlFor="search" className="sr-only">
            Search subjects or questions
          </label>
          <div className="relative mt-8 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pencil" size={20} />
            <input
              id="search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “Design Patterns” or “servlet life cycle”"
              className="input h-14 rounded-xl pl-12 text-[17px] shadow-[0_1px_0_var(--color-rule)]"
              autoComplete="off"
            />
          </div>

          {stats && (
            <p className="mt-4 text-sm text-pencil">
              {stats.papers} papers and {stats.questions} questions across {stats.subjects} subjects so far
            </p>
          )}
        </div>

        {/* a small "answer sheet" showing what the repeated-question feature looks like */}
        <div aria-hidden="true" className="relative mx-auto w-full max-w-md md:mr-0">
          <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-2 rounded-lg border border-rule bg-sheet" />
          <div className="relative rounded-lg border border-rule bg-paper p-6 shadow-[0_18px_40px_-24px_rgba(37,71,168,0.45)]">
            <div className="flex items-baseline justify-between border-b-2 border-redpen/40 pb-3">
              <span className="font-display font-semibold">302 Design Patterns</span>
              <span className="text-sm text-pencil">Most repeated</span>
            </div>
            <ol className="mt-4 space-y-4">
              <li>
                <p className="font-display text-lg font-semibold leading-snug">
                  <span className="marker marker-animate">Explain Singleton pattern with example.</span>
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm text-pencil">
                  <YearStamps years={[2022, 2023, 2024]} size="sm" /> asked 3 times
                </div>
              </li>
              <li>
                <p className="font-display text-lg font-semibold leading-snug">
                  <span className="marker">Explain Observer pattern.</span>
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm text-pencil">
                  <YearStamps years={[2022, 2023, 2025]} size="sm" /> asked 3 times
                </div>
              </li>
              <li className="opacity-60">
                <p className="font-display text-lg font-semibold leading-snug">Explain Adapter pattern.</p>
                <div className="mt-2 flex items-center gap-2 text-sm text-pencil">
                  <YearStamps years={[2022, 2024]} size="sm" /> asked twice
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchResults({ query }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError("");
    Promise.all([
      api.get("/subjects", { params: { q: query } }),
      api.get("/questions/search", { params: { q: query } }),
    ])
      .then(([s, q]) => !cancelled && setData({ subjects: s.data.subjects, questions: q.data.questions }))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => (cancelled = true);
  }, [query]);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Spinner label="Searching" />;

  if (!data.subjects.length && !data.questions.length) {
    return (
      <EmptyState title={`Nothing found for “${query}”`}>
        Check the spelling, or search with fewer words. If you have this paper, upload it so others can find it.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-10">
      {data.subjects.length > 0 && (
        <div>
          <h2 className="mb-3 text-xl font-semibold">Subjects</h2>
          <SubjectList subjects={data.subjects} />
        </div>
      )}
      {data.questions.length > 0 && (
        <div>
          <h2 className="mb-3 text-xl font-semibold">Questions</h2>
          <ul className="panel divide-y divide-rule">
            {data.questions.map((q) => (
              <li key={q._id}>
                <Link to={`/papers/${q.paper}`} className="block px-5 py-4 hover:bg-sheet">
                  <p className="font-display font-semibold">{q.text}</p>
                  <p className="mt-1 text-sm text-pencil">
                    {subjectLabel(q.subject)}, {q.year}
                    {q.marks ? `, ${q.marks} marks` : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SubjectList({ subjects }) {
  return (
    <ul className="panel divide-y divide-rule overflow-hidden">
      {subjects.map((s) => (
        <li key={s._id}>
          <Link to={`/subjects/${s._id}`} className="group flex items-center gap-4 px-5 py-4 hover:bg-sheet">
            <span className="w-12 shrink-0 font-display text-lg font-bold text-ballpoint">{s.code || "—"}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[17px] font-semibold">{s.name}</span>
              <span className="block text-sm text-pencil">
                {s.university} {s.course}, Sem {s.semester}
              </span>
            </span>
            <span className="hidden text-right text-sm text-pencil sm:block">
              {s.paperCount ? (
                <>
                  <span className="font-bold text-ink">{s.paperCount}</span> {s.paperCount === 1 ? "paper" : "papers"}
                  <span className="block">{s.yearRange}</span>
                </>
              ) : (
                "No papers yet"
              )}
            </span>
            <ChevronRight className="shrink-0 text-pencil transition-transform group-hover:translate-x-0.5" size={20} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Browse() {
  const [filters, setFilters] = useState(null);
  const [course, setCourse] = useState("MCA");
  const [subjects, setSubjects] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/subjects/filters").then((res) => {
      setFilters(res.data);
      if (!res.data.courses.includes("MCA")) setCourse(res.data.courses[0] || "");
    });
  }, []);

  useEffect(() => {
    setSubjects(null);
    api
      .get("/subjects", { params: course ? { course } : {} })
      .then((res) => setSubjects(res.data.subjects))
      .catch((err) => setError(errorMessage(err)));
  }, [course]);

  const bySemester = useMemo(() => {
    const map = new Map();
    (subjects || []).forEach((s) => {
      if (!map.has(s.semester)) map.set(s.semester, []);
      map.get(s.semester).push(s);
    });
    return [...map.entries()].sort((a, b) => b[0] - a[0]); // latest semester first
  }, [subjects]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-bold">Browse by course</h2>
        {filters && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Course">
            {filters.courses.map((c) => (
              <button
                key={c}
                onClick={() => setCourse(c)}
                aria-pressed={course === c}
                className={`rounded-full border px-4 py-1.5 font-display font-semibold transition-colors ${
                  course === c
                    ? "border-ballpoint bg-ballpoint text-white"
                    : "border-rule bg-paper text-pencil hover:text-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <ErrorBox message={error} />}
      {!subjects && !error && <Spinner />}
      {subjects && !subjects.length && <EmptyState title="No subjects in this course yet" />}

      <div className="space-y-8">
        {bySemester.map(([sem, list]) => (
          <section key={sem} aria-labelledby={`sem-${sem}`}>
            <h3 id={`sem-${sem}`} className="mb-2 text-base font-semibold text-pencil">
              Semester {sem}
            </h3>
            <SubjectList subjects={list} />
          </section>
        ))}
      </div>
    </div>
  );
}

function RecentPapers() {
  const [papers, setPapers] = useState([]);

  useEffect(() => {
    api.get("/papers/recent").then((res) => setPapers(res.data.papers)).catch(() => {});
  }, []);

  if (!papers.length) return null;

  return (
    <aside>
      <h2 className="mb-4 text-xl font-bold">Recently added</h2>
      <ul className="space-y-1">
        {papers.map((p) => (
          <li key={p._id}>
            <Link to={`/papers/${p._id}`} className="flex gap-3 rounded-lg p-2.5 hover:bg-paper">
              <FileText className="mt-0.5 shrink-0 text-ballpoint" size={19} />
              <span className="min-w-0">
                <span className="block truncate font-semibold">{p.subject?.name}</span>
                <span className="block text-sm text-pencil">
                  {paperTitle(p)}, {timeAgo(p.createdAt)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState(null);
  const q = useDebounce(query.trim());

  useEffect(() => {
    api.get("/stats").then((res) => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <>
      <Hero query={query} setQuery={setQuery} stats={stats} />
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">{q.length >= 2 ? <SearchResults query={q} /> : <Browse />}</div>
        <RecentPapers />
      </div>
    </>
  );
}
