const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const TWILIO_ACCOUNT_SID = "AC8af940150113ee0108f0e8a48a8aac62";
const TWILIO_AUTH_TOKEN = "1a991fadc4f238a967c40ab90c09d6d3";
const TWILIO_PHONE_NUMBER = "+15398003162";

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

const otpStore = {};

app.post("/send-otp", (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number is required." });
  }

  const otp = generateOTP();

  console.log("Generated OTP:", otp);

  otpStore[phoneNumber] = otp;

  client.messages
    .create({
      to: phoneNumber,
      from: TWILIO_PHONE_NUMBER,
      body: `Your OTP for login is: ${otp}`,
    })
    .then(() => {
      res.json({ message: "OTP sent successfully." });
    })
    .catch((error) => {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: "Failed to send OTP." });
    });
});

app.post("/verify-otp", (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res
      .status(400)
      .json({ error: "Phone number and OTP are required." });
  }

  const storedOTP = otpStore[phoneNumber];

  console.log("Stored OTP:", storedOTP);

  console.log(Number(storedOTP) === Number(otp));

  //   if (!Number(storedOTP) || Number(storedOTP) !== Number(storedOTP)) {
  //     return res.status(401).json({ error: "Invalid OTP." });
  //   }

  //   res.json({ message: "OTP verification successful. You are now logged in." });

  if (Number(storedOTP) === Number(otp)) {
    res.json({
      message: "OTP verification successful. You are now logged in.",
    });
  } else {
    return res.status(401).json({ error: "Invalid OTP." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
