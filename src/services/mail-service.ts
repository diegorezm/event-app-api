// TODO: test this
import jwt from "hono/jwt";
import { API_URL, SECRET_KEY } from "../env";
import { transporter } from "../config/mail";
import { HTTPException } from "hono/http-exception";
import userService from "./user-service";

class MailService {
  async verifyEmailToken(token: string) {
    try {
      const decoded = await jwt.verify(token, SECRET_KEY);

      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        throw new HTTPException(401, { message: "Token expirado." });
      }

      if (!decoded.email) {
        throw new HTTPException(401, { message: "Token inválido." });
      }

      const email = decoded.email as string;
      const user = await userService.getByEmail(email);

      // Update only the necessary field
      await userService.update(user.id, { emailVerifiedAt: new Date() });

      return true;
    } catch (error: any) {
      throw new HTTPException(401, {
        message:
          error.message === undefined
            ? "Falha na verificação do token."
            : error.message,
      });
    }
  }

  async sendVerificationEmail(userEmail: string) {
    try {
      const token = await jwt.sign(
        { email: userEmail, exp: Math.floor(Date.now() / 1000) + 60 * 60 },
        SECRET_KEY,
      );

      const verificationLink = `${API_URL}/auth/verify/mail/${token}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verificação de E-mail</title>
        </head>
        <body>
          <h1>Verificação de E-mail</h1>
          <p>Clique no botão abaixo para verificar seu e-mail.</p>
          <a href="${verificationLink}" style="display:inline-block;padding:10px 20px;background-color:#4CAF50;color:white;text-align:center;text-decoration:none;border-radius:5px;">Verificar E-mail</a>
        </body>
        </html>
      `;
      const info = await transporter.sendMail({
        to: userEmail,
        subject: "Código de verificação.",
        html: htmlContent,
      });
      return info;
    } catch (error: any) {
      throw error();
    }
  }
}
export default new MailService();
