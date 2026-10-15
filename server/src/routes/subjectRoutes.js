const router = require("express").Router();
const c = require("../controllers/subjectController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", c.getSubjects);
router.get("/filters", c.getFilters);
router.get("/:id", c.getSubject);
router.get("/:id/important", c.getImportantQuestions);

router.post("/", protect, adminOnly, c.createSubject);
router.delete("/:id", protect, adminOnly, c.deleteSubject);

module.exports = router;
