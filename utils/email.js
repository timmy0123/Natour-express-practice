import nodemailer from 'nodemailer';
import pug from 'pug';
import path from 'path';
import { convert } from 'html-to-text';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Natours Team <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  //1) Send the actual email
  async send(template, subject) {
    //1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      filename: this.filename,
      url: this.url,
      subject,
    });

    //2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    //3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
    );
  }
}

/*
export const sendEmail = async (options) => {
  //1) Create a transporter
  const transporter = nodemailer.createTransport({
    Gmail example
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      Activate in gmail "less secure app" option
    
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2) Define the email options
  const mailOptions = {
    from: 'natours team <hello@natours.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };
  //3) Send the email
  await transporter.sendMail(mailOptions);
};

*/
