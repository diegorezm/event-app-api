// TODO: test this
import { API_URL } from "../../env";
import { transporter } from "../../config/mail";
import userService from "../../services/user-service";
import tokenService from "../../services/token-service";
import { HTTPException } from "hono/http-exception";

class Mailer {
  async verifyEmailToken(token: string) {
    const decoded = await tokenService.verify(token);
    if (decoded.type === "login") {
      throw new HTTPException(401, { message: "Token inválido." });
    }
    const email = decoded.email as string;
    const user = await userService.getByEmail(email);
    await userService.update(user.id, { emailVerifiedAt: new Date() });
    return true;
  }

  async sendVerificationEmail(userEmail: string) {
    try {
      const token = await tokenService.sign({
        email: userEmail,
        type: "email_verification",
      });

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
export default new Mailer();
