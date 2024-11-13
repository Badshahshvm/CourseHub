const Course = require("../models/course")
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
require("dotenv").config();
cloudinary.config({
              cloud_name: process.env.CLOUD_NAME,
              api_key: process.env.API_KEY,
              api_secret: process.env.API_SECRET
});





const createCourse = async (req, res) => {

              try {

                            const uploadedImage = await cloudinary.uploader.upload(req.files.image.tempFilePath);
                            const token = req.headers.authorization.split(" ")[1];
                            const user = await jwt.verify(token, 'shivam 123');
                            if (user.role !== 'Admin') {
                                          return res.json({
                                                        success: false,
                                                        message: "Unauthorized Action"
                                          })
                            }
                            const course = new Course({
                                          title: req.body.title,
                                          description: req.body.description,
                                          userId: user._id,
                                          thumbnailId: uploadedImage.public_id,
                                          thumbnailUrl: uploadedImage.secure_url,
                                          category: req.body.category,
                                          createdBy: user.fullName
                            })

                            await course.save();
                            res.json({
                                          success: true,
                                          message: "Course is created Successfully",
                                          course: course
                            })


              }
              catch (err) {
                            console.log(err)
                            res.json({
                                          success: false,
                                          message: err.message
                            })
              }
}

const deleteCourse = async (req, res) => {
              try {

                            const token = req.headers.authorization.split(" ")[1];
                            const user = await jwt.verify(token, 'shivam 123');
                            const course = await Course.findById(req.params.id);
                            if (!course) {
                                          res.json({
                                                        success: false,
                                                        message: "Course Not Found"
                                          })
                            }
                            if ((course.userId.toString() !== user._id) || user.role != 'Admin') {
                                          return res.status(403).json({
                                                        success: false,
                                                        message: "Unauthorized action"
                                          });
                            }


                            await cloudinary.uploader.destroy(course.thumbnailId);
                            const deletedCourse = await Course.findByIdAndDelete(req.params.id);
                            res.json({
                                          success: true,
                                          message: "Course delete Successfully"
                            })

              }
              catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            })
              }

}
const updateCourse = async (req, res) => {
              try {

                            const token = req.headers.authorization.split(" ")[1];
                            const user = await jwt.verify(token, 'shivam 123');
                            const course = await Course.findById(req.params.courseId);


                            if (!course) {
                                          return res.json({
                                                        success: false,
                                                        message: "Course not found"
                                          });
                            }

                            if (user.role !== 'Admin') {
                                          return res.json({
                                                        success: false,
                                                        message: "You do not have permission to update this course"
                                          });
                            }
                            else {
                                          const updatedData = {
                                                        title: req.body.title,
                                                        description: req.body.description,
                                                        userId: user._id,
                                                        thumbnailId: course.thumbnailId,
                                                        thumbnailUrl: course.thumbnailUrl,
                                                        category: req.body.category,
                                                        createdBy: user.fullName
                                          };

                                          if (req.files && req.files.image) {
                                                        await cloudinary.uploader.destroy(course.thumbnailId);
                                                        const updatedThumbnail = await cloudinary.uploader.upload(req.files.image.tempFilePath);
                                                        updatedData.thumbnailUrl = updatedThumbnail.secure_url;
                                                        updatedData.thumbnailId = updatedThumbnail.public_id;
                                          }

                                          const updatedCourse = await Course.findByIdAndUpdate(req.params.courseId, updatedData, { new: true });


                                          res.json({
                                                        success: true,
                                                        message: "Course updated successfully",
                                                        course: updatedCourse
                                          });

                            }



              }
              catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            })
              }

}
const getAllCourse = async (req, res) => {
              try {
                            const courses = await Course.find({}).select('-lectures');
                            res.json({
                                          success: true,
                                          message: "Course details here",
                                          courses: courses
                            });
              } catch (err) {
                            res.status(500).json({
                                          success: false,
                                          message: err.message
                            });
              }
};

const getLectureByCourseId = async (req, res) => {
              try {
                            const course = await Course.findById(req.params.id)
                            if (!course) {
                                          res.json({
                                                        success: false,
                                                        message: "Course Not Found"
                                          })
                            }
                            res.json({
                                          success: true,
                                          message: "Course is here",
                                          course: course.lectures
                            })

              }
              catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            })
              }

}

const addLecturesByCourseId = async (req, res) => {
              try {
                            const { title, description } = req.body;

                            const token = req.headers.authorization.split(" ")[1];
                            const user = jwt.verify(token, 'shivam 123');

                            const course = await Course.findById(req.params.id);
                            if (!course) {
                                          return res.json({
                                                        success: false,
                                                        message: "Course Not Found"
                                          });
                            }

                            if (user.role !== 'Admin') {
                                          return res.json({
                                                        success: false,
                                                        message: "Unauthorized Action"
                                          });
                            }

                            const lectureData = {
                                          title,
                                          description,
                                          lecture: {}
                            };

                            if (req.files && req.files.video) {
                                          const uploadedLecture = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
                                                        resource_type: 'video'
                                          });

                                          lectureData.lecture.lectureId = uploadedLecture.public_id;
                                          lectureData.lecture.lectureUrl = uploadedLecture.secure_url;
                            }

                            course.lectures.push(lectureData);
                            course.numberOfLectures = course.lectures.length; // Use the length of course.lectures

                            await course.save();

                            res.json({
                                          success: true,
                                          message: "Successfully added lecture",
                                          course: course
                            });

              } catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            });
              }
};

const deleteLectureByCourseId = async (req, res) => {
              try {
                            const token = req.headers.authorization.split(" ")[1];
                            const user = jwt.verify(token, 'shivam 123');

                            if (user.role !== 'Admin') {
                                          return res.json({
                                                        success: false,
                                                        message: "Unauthorized Action"
                                          });
                            }

                            const courseId = req.params.courseId;
                            const lectureId = req.params.lectureId;

                            // Find the course by ID
                            const course = await Course.findById(courseId);
                            if (!course) {
                                          return res.json({
                                                        success: false,
                                                        message: "Course Not Found"
                                          });
                            }


                            const lectureIndex = course.lectures.findIndex(
                                          (lecture) => lecture.lecture.lectureId === lectureId
                            );

                            if (lectureIndex === -1) {
                                          return res.json({
                                                        success: false,
                                                        message: "Lecture Not Found"
                                          });
                            }


                            course.lectures.splice(lectureIndex, 1);


                            course.numberOfLectures = course.lectures.length;

                            await course.save();

                            res.json({
                                          success: true,
                                          message: "Lecture deleted successfully",
                                          course: course,
                            });
              } catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            });
              }
};

const getCourseDetails = async (req, res) => {
              try {
                            const token = req.headers.authorization.split(" ")[1];
                            const user = jwt.verify(token, 'shivam 123');

                            if (user.role !== 'Admin') {
                                          return res.json({
                                                        success: false,
                                                        message: "Unauthorized Action"
                                          });
                            }

                            const courseId = req.params.courseId;
                            const course = await Course.findById(courseId);
                            if (!course) {
                                          return res.json({
                                                        success: false,
                                                        message: "Course Not Found"
                                          });
                            }
                            res.json({
                                          success: true,
                                          message: "Course Details are here",
                                          course: course
                            })


              }
              catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            })
              }
}
module.exports = { getAllCourse, getLectureByCourseId, deleteCourse, updateCourse, addLecturesByCourseId, createCourse, deleteLectureByCourseId, getCourseDetails }