const Payment = require("../models/payment")
const User = require("../models/user")
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config();
const mongoose = require("mongoose");
const Razorpay = require("razorpay")
const axios = require("axios")
const crypto = require("crypto")

const razorpay = new Razorpay({
              key_id: process.env.RAZORPAY_KEY_ID,
              key_secret: process.env.RZORPAY_SECRET
})



const getRazorPayKey = async (req, res) => {


              try {
                            res.json({

                                          success: true, message: "Pamenent key is found",
                                          keys: process.env.RAZORPAY_KEY_ID

                            })

              }
              catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            })
              }
}
const buySubscription = async (req, res) => {
              try {
                            const token = req.headers.authorization.split(" ")[1];
                            const userVerify = jwt.verify(token, 'shivam 123');
                            const user = await User.findById(userVerify._id);

                            if (!user) {
                                          return res.json({ success: false, message: "User is not registered" });
                            }
                            if (user.role === 'Admin') {
                                          return res.json({ success: false, message: "Admin cannot purchase a subscription" });
                            }

                            const subscription = await razorpay.subscriptions.create({
                                          plan_id: process.env.RAZORPAY_PLAN_ID,
                                          customer_notify: 1,
                                          total_count: 12 // Adjust the count based on your requirements
                            });
                            console.log(subscription)

                            user.subscription.subscriptionId = subscription.id;
                            user.subscription.status = subscription.status;
                            await user.save();

                            res.json({
                                          success: true,
                                          message: "Subscribed successfully",
                                          subscription_id: subscription.id,
                                          user,
                            });
              } catch (err) {
                            console.log(err)
                            res.json({ success: false, message: err.message });
              }
}
// };
// const verifySubscription = async (req, res) => {
//               try {
//                             // Get token and verify user
//                             const token = req.headers.authorization?.split(" ")[1];


//                             const userVerify = jwt.verify(token, 'shivam 123');
//                             const user = await User.findById(userVerify._id);
//                             if (!user) {
//                                           return res.status(404).json({ success: false, message: "User not found" });
//                             }

//                             const { razorpay_payment_id, razorpay_subscription_id } = req.body;
//                             if (!razorpay_payment_id || !razorpay_subscription_id) {
//                                           return res.status(400).json({ success: false, message: "Payment and subscription IDs are required" });
//                             }

//                             const subscriptionId = user.subscription.subscriptionId;
//                             if (!subscriptionId) {
//                                           return res.status(400).json({ success: false, message: "User has no active subscription" });
//                             }

//                             // Verify the subscription with Razorpay
//                             const razorpayResponse = await axios.get(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}`, {
//                                           auth: {
//                                                         username: process.env.RAZORPAY_KEY_ID,
//                                                         password: process.env.RAZORPAY_SECRET,
//                                           },
//                             });

//                             // Check if subscription ID and status match
//                             if (
//                                           razorpayResponse.data.id !== razorpay_subscription_id &&
//                                           razorpayResponse.data.status !== 'active' // Update according to required status
//                             ) {
//                                           return res.json({
//                                                         success: false,
//                                                         message: "Subscription verification failed",
//                                           });
//                             } else {
//                                           const payment = await Payment.create({
//                                                         razorpay_payment_id,
//                                                         razorpay_subscription_id
//                                           })

//                                           user.subscription.status = 'active'
//                                           await user.save()

//                                           return res.json({
//                                                         success: true, message: "User is verified",
//                                                         user: user
//                                           })



//                             }
//               } catch (err) {
//                             res.status(500).json({
//                                           success: false,
//                                           message: err.message,
//                             });
//               }
// };

const verifyPayments = async (req, res) => {
              try {
                            const user = await User.findById(userVerify._id);
                            if (!user) {
                                          return res.status(404).json({ success: false, message: "User not found" });
                            }

                            const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;


                            const subscriptionId = user.subscription.subscriptionId;

                            const generateSignature = await crypto.createHash('sha256', process.env.RAZORPAY_SECRET).update(`${razorpay_payment_id} | ${subscriptionId}`).digest('hex');

                            if (generateSignature !== razorpay_signature) {
                                          return res.json({
                                                        success: false,
                                                        message: "Subscription verification failed",
                                          })
                            }

                            const payment = await Payment.create({
                                          razorpay_payment_id,
                                          razorpay_subscription_id,
                                          razorpay_signature
                            })
                            user.subscription.status = 'active'
                            await user.save()

                            return res.json({
                                          success: true, message: "User is verified",
                                          user: user
                            })




              }
              catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            })
              }
}
const allPayments = async (req, res) => {
              try {
                            const token = req.headers.authorization.split(" ")[1];
                            const userVerify = jwt.verify(token, 'shivam 123');
                            const { count } = req.query
                            if (userVerify.role !== 'Admin') {
                                          return res.jaon({
                                                        success: false,
                                                        message: "You are not authorized"
                                          })
                            }
                            const payments = await razorpay.subscriptions.all(
                                          {
                                                        count: count || 10
                                          }
                            )
                            res.json({
                                          success: true,
                                          message: "All payemnts",
                                          payments: payments

                            })




              }
              catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message

                            })
              }
}

const cancelSubscription = async (req, res) => {
              try {
                            const token = req.headers.authorization.split(" ")[1];
                            const userVerify = jwt.verify(token, 'shivam 123');
                            const user = await User.findById(userVerify._id);

                            if (!user) {
                                          return res.json({ success: false, message: "User must be logged in" });
                            }

                            if (user.role === 'Admin') {
                                          return res.json({ success: false, message: "Admin cannot subscribe" });
                            }

                            const subscriptionId = user.subscription.subscriptionId;

                            if (!subscriptionId) {
                                          return res.json({ success: false, message: "No active subscription found" });
                            }

                            const subscription = await razorpay.subscriptions.cancel(subscriptionId);

                            user.subscription.status = subscription.status;
                            await user.save();

                            res.json({
                                          success: true,
                                          message: "Subscription cancelled successfully",
                                          user,
                            });
              } catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message,
                            });
              }
};

module.exports = {
              allPayments, buySubscription, getRazorPayKey,
              cancelSubscription, verifyPayments

}