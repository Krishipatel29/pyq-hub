import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowBigUp, Bookmark } from "lucide-react";
import toast from "react-hot-toast";
import api, { errorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";

// Upvote + bookmark buttons for one question.
// Updates the UI first (optimistic), and rolls back if the API call fails.
export default function QuestionActions({ question, showUpvote = true }) {
  const { user, setBookmark } = useAuth();
  const navigate = useNavigate();

  const [upvoted, setUpvoted] = useState(Boolean(question.upvoted));
  const [count, setCount] = useState(question.upvoteCount || 0);
  const [saved, setSaved] = useState(
    question.bookmarked ?? Boolean(user?.bookmarks?.includes(question._id))
  );
  const [busy, setBusy] = useState(false);

  function needLogin() {
    toast("Log in to vote and save questions");
    navigate("/login");
  }

  async function handleUpvote() {
    if (!user) return needLogin();
    if (busy) return;
    const prev = { upvoted, count };
    setUpvoted(!upvoted);
    setCount(count + (upvoted ? -1 : 1));
    setBusy(true);
    try {
      const res = await api.post(`/questions/${question._id}/upvote`);
      setUpvoted(res.data.upvoted);
      setCount(res.data.upvoteCount);
    } catch (err) {
      setUpvoted(prev.upvoted);
      setCount(prev.count);
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (!user) return needLogin();
    const prev = saved;
    setSaved(!saved);
    try {
      const res = await api.post(`/questions/${question._id}/bookmark`);
      setSaved(res.data.bookmarked);
      setBookmark(question._id, res.data.bookmarked);
      toast.success(res.data.bookmarked ? "Saved" : "Removed from saved");
    } catch (err) {
      setSaved(prev);
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      {showUpvote && (
        <button
          onClick={handleUpvote}
          aria-pressed={upvoted}
          title="Mark as important"
          className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-bold transition-colors ${
            upvoted ? "bg-ballpoint-soft text-ballpoint" : "text-pencil hover:bg-sheet hover:text-ink"
          }`}
        >
          <ArrowBigUp size={20} fill={upvoted ? "currentColor" : "none"} />
          {count}
        </button>
      )}
      <button
        onClick={handleSave}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save question"}
        title={saved ? "Remove from saved" : "Save for revision"}
        className={`rounded-lg p-1.5 transition-colors ${
          saved ? "text-ballpoint" : "text-pencil hover:bg-sheet hover:text-ink"
        }`}
      >
        <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
