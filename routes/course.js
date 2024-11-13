const express = require("express");
const { getLectureByCourseId, deleteCourse, getAllCourse, addLecturesByCourseId, createCourse, updateCourse, deleteLectureByCourseId, getCourseDetails } = require("../controllers/course");
const checkAuth = require("../middleware/checkAuth");

const router = express.Router();


router.get("/:id", checkAuth, getLectureByCourseId)
router.post("/:id", checkAuth, addLecturesByCourseId)
router.get("/", checkAuth, getAllCourse)
router.post("/", checkAuth, createCourse)
router.put("/:courseId", checkAuth, updateCourse)
router.delete("/:courseId/:lectureId", checkAuth, deleteLectureByCourseId);
router.get("/detail/:courseId", checkAuth, getCourseDetails)

router.delete("/:id", checkAuth, deleteCourse)

module.exports = router;