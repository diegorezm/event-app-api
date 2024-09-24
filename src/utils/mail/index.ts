import { transporter } from "../../config/mail";
import { MAIL_USER } from "../../env";
import { InternalServerError } from "../../types";

export type SendEmailProps = {
  to: string;
  subject: string;
  content: string;
}

export default async function sendEmail({ to, subject, content }: SendEmailProps) {
  try {
    const info = await transporter.sendMail({
      from: MAIL_USER,
      to,
      subject,
      text: content,
    });
    return info;
  } catch (error) {
    if (error instanceof Error) {
      throw new InternalServerError(error.message);
    }
    throw new InternalServerError("Não foi possível enviar o email.");
  }
}