const mongoose = require("mongoose");

const courseSchema = mongoose.Schema({

              title: {
                            type: String,
                            required: ['true', 'Title is required'],
                            minLength: [8, 'Title must be at least 8 charcters'], maxLength: [59, 'Title should be less than 60 characters'],
                            trim: true
              },
              description:
              {
                            type: String,
                            required: ['true', 'Title is required'],
                            minLength: [8, 'Title must be at least 8 charcters'], maxLength: [199, 'Title should be less than 200 characters']
              },
              category:
              {
                            type: String,
                            required: [true, 'Category is required']

              },
              lectures:
                            [{
                                          title: String,
                                          description: String,
                                          lecture:
                                          {
                                                        lectureId:
                                                        {
                                                                      type: String,
                                                                      required: true
                                                        },
                                                        lectureUrl:
                                                        {
                                                                      type: String,
                                                                      required: true
                                                        }
                                          }
                            }],

              thumbnailId:
              {
                            type: String,
                            required: true
              },
              thumbnailUrl:
              {
                            type: String,
                            required: true
              },

              numberOfLectures: {
                            type: Number,
                            default: 0
              },
              createdBy:
              {
                            type: String,
                            required: ["true", "Author is required"]

              },
              userId:
              {
                            type: String,
                            required: true
              },
},
              {
                            timestamps: true
              })


const courseModel = mongoose.model("Course", courseSchema)
module.exports = courseModel