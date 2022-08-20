import nodemailer from "nodemailer";
import config from "config";

const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    let transporter = nodemailer.createTransport({
      host: config.get<string>("mail_host"),
      port: config.get<number>("mail_port"),
      secure: false,
      service: config.get<string>("mail_service"),
      auth: {
        user: config.get<string>("mail_user"),
        pass: config.get<string>("mail_pass"),
      },
    });

    let info = await transporter.sendMail({
      to,
      subject,
      html,
    });
    return info;
  } catch (error: any) {
    return false;
  }
};

export default sendMail;
