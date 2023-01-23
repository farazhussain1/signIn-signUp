import {createTransport} from "nodemailer";

export const transport = createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "0c71cf721c7ca6",
      pass: "8a539da4df6f11"
    }
  });

