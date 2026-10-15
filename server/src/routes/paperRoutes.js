const router = require("express").Router();
const c = require("../controllers/paperController");
const { protect, optionalAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/recent", c.getRecentPapers);
router.get("/mine", protect, c.getMyPapers);
router.get("/:id", optionalAuth, c.getPaper);

router.post("/", protect, upload.single("file"), c.createPaper);
router.delete("/:id", protect, c.deletePaper);

module.exports = router;
