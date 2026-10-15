import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api/axios";
import { Spinner, EmptyState, ErrorBox } from "../components/Common";
import QuestionActions from "../components/QuestionActions";
import { EXAM_LABEL, subjectLabel } from "../utils/format";

export default function Bookmarks() {
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/questions/bookmarks")
      .then((res) => setQuestions(res.data.questions))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  // group saved questions by subject, so revision is subject-wise
  const groups = useMemo(() => {
    const map = new Map();
    (questions || []).forEach((q) => {
      const key = q.subject?._id || "other";
      if (!map.has(key)) map.set(key, { subject: q.subject, items: [] });
      map.get(key).items.push(q);
    });
    return [...map.values()];
  }, [questions]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold">Saved questions</h1>
      <p className="mt-2 text-pencil">Your revision list. Save any question with the bookmark icon.</p>

      <div className="mt-8">
        {error && <ErrorBox message={error} />}
        {!questions && !error && <Spinner />}
        {questions && !questions.length && (
          <EmptyState title="Nothing saved yet" action={<Link to="/" className="btn-primary">Browse subjects</Link>}>
            Open a subject, check its most repeated questions and save the ones you want to revise.
          </EmptyState>
        )}

        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.subject?._id || "other"}>
              <h2 className="mb-3 text-xl font-bold">
                {g.subject ? (
                  <Link to={`/subjects/${g.subject._id}`} className="hover:text-ballpoint">{subjectLabel(g.subject)}</Link>
                ) : "Other"}
                <span className="ml-2 text-base font-normal text-pencil">{g.items.length}</span>
              </h2>
              <ul className="panel divide-y divide-rule">
                {g.items.map((q) => (
                  <li key={q._id} className="flex gap-4 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <Link to={`/papers/${q.paper?._id}`} className="text-[17px] leading-snug hover:text-ballpoint">
                        {q.text}
                      </Link>
                      <p className="mt-1 text-sm text-pencil">
                        {q.paper ? `${q.paper.year} ${EXAM_LABEL[q.paper.examType]}` : q.year}
                        {q.marks ? `, ${q.marks} marks` : ""}
                      </p>
                    </div>
                    <QuestionActions question={{ ...q, bookmarked: true }} showUpvote={false} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
