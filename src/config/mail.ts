import nodemailer from "nodemailer";
import { MAIL_HOST, MAIL_PASS, MAIL_PORT, MAIL_USER } from "../env";

if (MAIL_HOST === undefined) {
  throw new Error("Email server not configured.");
}

export const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});
