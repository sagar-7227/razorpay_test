import { instance } from "../server.js";
import crypto from "crypto";
import { Payment } from "../models/paymentModel.js";
export const checkout = async (req, res) => {

    const options = {
        amount: Number(req.body.amount * 100),
        currency: "INR",
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
        success: true,
        order
    })
}

export const paymentVerification = async (req, res) => {
    // Receive Payment Data 
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Creating hmac object  
    let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET);

    // Passing the data to be hashed 
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);

    // Creating the hmac in the required format 
    const generated_signature = hmac.digest('hex');

    if (razorpay_signature === generated_signature) {

        await Payment.create({
            razorpay_order_id, razorpay_payment_id, razorpay_signature
        })
        // store in database
        res.redirect(`http://localhost:3000/paymentsuccess?reference=${razorpay_order_id}`)
    }
    else {
        res.status(400).json({ success: false, message: "Payment verification failed" })
    }
}