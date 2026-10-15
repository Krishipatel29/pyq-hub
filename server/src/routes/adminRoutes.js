const router = require("express").Router();
const c = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

// every admin route needs login + admin role
router.use(protect, adminOnly);

router.get("/stats", c.getAdminStats);
router.get("/papers", c.getPapersByStatus);
router.patch("/papers/:id/status", c.updatePaperStatus);

module.exports = router;
