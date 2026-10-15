import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Trash2, FileUp, X, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import api, { errorMessage } from "../api/axios";
import { Spinner } from "../components/Common";

const MAX_SIZE = 10 * 1024 * 1024;
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 12 }, (_, i) => THIS_YEAR - i);
const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const emptyQuestion = () => ({ id: crypto.randomUUID(), text: "", marks: "", topic: "" });

function Step({ n, title, hint, children }) {
  return (
    <section className="panel p-5 sm:p-7">
      <div className="mb-5 flex gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ballpoint font-display font-bold text-white">
          {n}
        </span>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {hint && <p className="text-sm text-pencil">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function UploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInput = useRef(null);

  const [subjects, setSubjects] = useState(null);
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [form, setForm] = useState({ subjectId: "", year: String(THIS_YEAR), month: "", examType: "external" });
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/subjects").then((res) => {
      const list = res.data.subjects;
      setSubjects(list);
      // coming from a subject page -> pre-select that subject
      const pre = list.find((s) => s._id === location.state?.subjectId);
      if (pre) {
        setCourse(pre.course);
        setSemester(String(pre.semester));
        setForm((f) => ({ ...f, subjectId: pre._id }));
      }
    });
  }, [location.state]);

  const courses = useMemo(() => [...new Set((subjects || []).map((s) => s.course))], [subjects]);
  const semesters = useMemo(
    () => [...new Set((subjects || []).filter((s) => s.course === course).map((s) => s.semester))].sort((a, b) => a - b),
    [subjects, course]
  );
  const subjectOptions = (subjects || []).filter((s) => s.course === course && String(s.semester) === semester);

  function updateQuestion(id, key, value) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, [key]: value } : q)));
  }

  function addBulk() {
    // one question per line; "(7)" or "[7 marks]" at the end is read as marks
    const lines = bulk
      .split("\n")
      .map((l) => l.replace(/^\s*(Q\.?\s*)?\d+[.)]\s*/i, "").trim())
      .filter((l) => l.length >= 5);
    if (!lines.length) return toast.error("Paste at least one question");

    const parsed = lines.map((line) => {
      const m = line.match(/[([]\s*(\d{1,2})\s*(marks?)?\s*[)\]]\s*$/i);
      return { ...emptyQuestion(), text: m ? line.slice(0, m.index).trim() : line, marks: m ? m[1] : "" };
    });
    setQuestions((qs) => [...qs.filter((q) => q.text.trim()), ...parsed]);
    setBulk("");
    setShowBulk(false);
    toast.success(`Added ${parsed.length} questions`);
  }

  function pickFile(f) {
    if (!f) return;
    if (!["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      return toast.error("Choose a PDF, JPG, PNG or WEBP file");
    }
    if (f.size > MAX_SIZE) return toast.error("File is larger than 10 MB");
    setFile(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const filled = questions
      .filter((q) => q.text.trim())
      .map(({ text, marks, topic }) => ({ text: text.trim(), marks: Number(marks) || 0, topic: topic.trim() }));

    if (!form.subjectId) return setError("Choose the subject of this paper.");
    if (!filled.length && !file) return setError("Add the paper file, or type at least one question.");

    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, v));
    body.append("questions", JSON.stringify(filled));
    if (file) body.append("file", file);

    setSubmitting(true);
    try {
      const res = await api.post("/papers", body);
      toast.success(res.data.message);
      navigate(res.data.paper.status === "approved" ? `/papers/${res.data.paper._id}` : "/my-uploads");
    } catch (err) {
      setError(errorMessage(err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  if (!subjects) return <Spinner />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold">Upload a paper</h1>
      <p className="mt-2 text-pencil">
        An admin checks every paper before it goes live. Typed questions are what make the repeated-question list work.
      </p>

      {error && <p className="mt-6 rounded-lg bg-redpen-soft px-4 py-3 text-redpen" role="alert">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <Step n={1} title="Which paper is it?">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="course" className="label">Course</label>
              <select
                id="course"
                className="input"
                value={course}
                onChange={(e) => {
                  setCourse(e.target.value);
                  setSemester("");
                  setForm({ ...form, subjectId: "" });
                }}
                required
              >
                <option value="">Select</option>
                {courses.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="semester" className="label">Semester</label>
              <select
                id="semester"
                className="input"
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value);
                  setForm({ ...form, subjectId: "" });
                }}
                disabled={!course}
                required
              >
                <option value="">Select</option>
                {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="subject" className="label">Subject</label>
              <select
                id="subject"
                className="input"
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                disabled={!semester}
                required
              >
                <option value="">Select</option>
                {subjectOptions.map((s) => (
                  <option key={s._id} value={s._id}>{s.code ? `${s.code} ` : ""}{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="examType" className="label">Exam</label>
              <select id="examType" className="input" value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
                <option value="external">External</option>
                <option value="internal">Internal</option>
                <option value="retest">Retest</option>
              </select>
            </div>
            <div>
              <label htmlFor="year" className="label">Year</label>
              <select id="year" className="input" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="month" className="label">Month <span className="font-normal text-pencil">(optional)</span></label>
              <select id="month" className="input" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}>
                {MONTHS.map((m) => <option key={m} value={m}>{m || "Not sure"}</option>)}
              </select>
            </div>
          </div>
        </Step>

        <Step n={2} title="Type the questions" hint="Skip the OR choices you don't remember. Marks and topic are optional.">
          <div className="mb-4">
            <button type="button" onClick={() => setShowBulk((s) => !s)} className="inline-flex items-center gap-2 text-sm font-bold text-ballpoint" aria-expanded={showBulk}>
              <ClipboardList size={17} /> {showBulk ? "Close" : "Paste all questions at once"}
            </button>
            {showBulk && (
              <div className="mt-3 rounded-lg bg-sheet p-4">
                <label htmlFor="bulk" className="label">One question per line</label>
                <textarea
                  id="bulk"
                  rows={6}
                  className="input font-sans"
                  value={bulk}
                  onChange={(e) => setBulk(e.target.value)}
                  placeholder={"1. Explain Singleton pattern with example. (7)\n2. Explain Observer pattern. (7)"}
                />
                <p className="mt-1.5 text-sm text-pencil">Numbers at the start are removed. Marks in brackets at the end are read automatically.</p>
                <button type="button" onClick={addBulk} className="btn-primary mt-3 py-2">Add these questions</button>
              </div>
            )}
          </div>

          <ol className="space-y-3">
            {questions.map((q, i) => (
              <li key={q.id} className="rounded-lg border border-rule p-3 sm:p-4">
                <div className="flex gap-3">
                  <span className="pt-2.5 font-display font-bold text-pencil">Q{i + 1}</span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <label className="sr-only" htmlFor={`q-${q.id}`}>Question {i + 1}</label>
                    <textarea
                      id={`q-${q.id}`}
                      rows={2}
                      className="input resize-y"
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                      placeholder="e.g. Explain Singleton pattern with example."
                      maxLength={1000}
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        className="input w-24"
                        value={q.marks}
                        onChange={(e) => updateQuestion(q.id, "marks", e.target.value)}
                        placeholder="Marks"
                        aria-label={`Marks for question ${i + 1}`}
                      />
                      <input
                        className="input"
                        value={q.topic}
                        onChange={(e) => updateQuestion(q.id, "topic", e.target.value)}
                        placeholder="Topic, e.g. Creational"
                        aria-label={`Topic for question ${i + 1}`}
                        maxLength={60}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuestions((qs) => (qs.length > 1 ? qs.filter((x) => x.id !== q.id) : [emptyQuestion()]))}
                    className="self-start rounded-md p-2 text-pencil hover:bg-redpen-soft hover:text-redpen"
                    aria-label={`Remove question ${i + 1}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])} className="btn-ghost mt-3">
            <Plus size={17} /> Add question
          </button>
        </Step>

        <Step n={3} title="Attach the paper" hint="PDF or a clear photo, up to 10 MB. Optional if you typed the questions.">
          {file ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-rule bg-sheet px-4 py-3">
              <span className="min-w-0 truncate">
                <span className="font-semibold">{file.name}</span>
                <span className="ml-2 text-sm text-pencil">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </span>
              <button type="button" onClick={() => setFile(null)} className="rounded p-1.5 text-pencil hover:text-redpen" aria-label="Remove file">
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]); }}
              className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
                dragging ? "border-ballpoint bg-ballpoint-soft" : "border-rule hover:border-ballpoint/60"
              }`}
            >
              <FileUp className="text-ballpoint" size={28} />
              <span className="font-display font-semibold">Drop the file here or click to choose</span>
              <span className="text-sm text-pencil">PDF, JPG, PNG or WEBP</span>
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => pickFile(e.target.files[0])}
          />
        </Step>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost">Cancel</button>
          <button className="btn-primary px-6" disabled={submitting}>
            {submitting ? "Uploading…" : "Submit for review"}
          </button>
        </div>
      </form>
    </div>
  );
}
