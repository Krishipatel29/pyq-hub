const router = require("express").Router();
const c = require("../controllers/questionController");
const { protect } = require("../middleware/auth");

router.get("/search", c.searchQuestions);
router.get("/bookmarks", protect, c.getBookmarks);
router.post("/:id/upvote", protect, c.toggleUpvote);
router.post("/:id/bookmark", protect, c.toggleBookmark);

module.exports = router;
