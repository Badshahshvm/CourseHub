const express = require("express");
require("dotenv").config()
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload")
const user = require("./routes/user")
const course = require("./routes/course")
const payment = require("./routes/payment")





app.use(fileUpload({
              useTempFiles: true,
              // tempFileDir: '/tmp/'
}))
app.use(cors())
app.use(express.json())
mongoose.connect(process.env.mongoURI).then(() => console.log("db is connected")).catch((err) => console.log(err))

app.use("/api/v1/course", course)
app.use("/api/v1/payments", payment)
app.use("/api/v1/user", user)
app.all("*", (req, res) => {
              res.json({
                            message: "OOPS!! 404 Page not found"
              })
})
app.listen(process.env.PORT, () => {
              console.log("server is running")
})

