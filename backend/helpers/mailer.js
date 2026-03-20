import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  host: "mail.bbastian.dev",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});
