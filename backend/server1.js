import 'dotenv/config';
import express from "express";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import nodemailer from "nodemailer";
import crypto from "crypto";

const app = express();
app.use(express.json());
app.use(cors());

// 🔗 Koneksi ke Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY // gunakan service_role key
);

// ✉️ Konfigurasi pengirim email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // gunakan App Password Gmail
  },
});

// 🧩 Generate kode referral
function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// 🔑 Generate token verifikasi (6 karakter huruf + angka)
function generateVerificationToken() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// 🧱 Endpoint Register
app.post("/api/register", async (req, res) => {
  try {
    const { username, name, email, password, referred_by } = req.body;

    // Cek email sudah terdaftar
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = generateReferralCode();
    const verificationToken = generateVerificationToken();
    const tokenExpiredAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // Berlaku 24 jam

    // Simpan user baru ke database
    const { error } = await supabase.from("users").insert([
      {
        username,
        name,
        email,
        password: hashedPassword,
        referred_by,
        referral_code: referralCode,
        is_verified: false,
        verification_token: verificationToken,
        token_expired_at: tokenExpiredAt,
      },
    ]);

    if (error) throw error;

    // 💌 Kirim email berisi kode verifikasi
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
        <div style="max-width: 480px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(90deg, #007bff, #00aaff); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">Stockwise</h1>
            <p style="margin: 5px 0 0;">Account Verification</p>
          </div>
          <div style="padding: 30px; text-align: center;">
            <h2 style="color: #333;">Hello, ${name}!</h2>
            <p style="color: #555; font-size: 16px;">Thank you for registering on <strong>Stockwise</strong>.</p>
            <p style="color: #555; font-size: 16px;">Here is your verification code:</p>
            <div style="margin: 25px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #007bff;">
                ${verificationToken}
              </span>
            </div>
            <p style="color: #999;">This code will expire in 24 hours.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 13px; color: #888;">
              If you didn’t create an account, you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Stockwise" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Stockwise Verification Code",
      html: htmlContent,
    });

    res.status(201).json({
      message: "✅ Registration successful! Verification code sent to email.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Route untuk resend verification code
app.post("/api/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Generate kode acak 6 digit
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Simpan kode ke "database" (sementara pakai Map)
    userTokens.set(email, code);

    // Kirim email
    await transporter.sendMail({
      from: '"Stockwise App" <youremail@gmail.com>',
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #0070F3;">Stockwise Verification</h2>
          <p>Hello,</p>
          <p>Your verification code is:</p>
          <div style="font-size: 24px; font-weight: bold; margin: 16px 0; letter-spacing: 4px; color: #0070F3;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="margin-top: 24px;">Best regards,<br/><strong>Stockwise Team</strong></p>
        </div>
      `,
    });

    res.json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send verification code" });
  }
});

// ✅ Verifikasi via kode (manual input dari user)
app.post("/api/verify", async (req, res) => {
  try {
    const { email, code } = req.body;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) return res.status(400).json({ message: "User not found" });
    if (user.is_verified) return res.status(400).json({ message: "User already verified" });
    if (new Date(user.token_expired_at) < new Date())
      return res.status(400).json({ message: "Verification code expired" });

    if (user.verification_token !== code)
      return res.status(400).json({ message: "Invalid verification code" });

    // Update status menjadi verified
    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_verified: true,
        verification_token: null,
        token_expired_at: null,
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    res.json({ message: "✅ Email verified successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// 🟢 Jalankan server
app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));
