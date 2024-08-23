import { transporter } from "../../config/mail";
import tokenService from "../../services/token-service";
import { HTTPException } from "hono/http-exception";

class Mailer {
  async sendVerificationEmail(userEmail: string) {
    try {
      const token = await tokenService.sign({
        email: userEmail,
        type: "email_verification",
      });

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
          <p>Seu código de verificação é:</p>
          <p><strong>${token}</strong></p>
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
      throw new HTTPException(500, {
        message: "Falha ao enviar e-mail de verificação.",
      });
    }
  }

  async sendPasswordResetEmail(userEmail: string) {
    try {
      const token = await tokenService.sign({
        email: userEmail,
        type: "password_reset",
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinição de Senha</title>
        </head>
        <body>
          <h1>Redefinição de Senha</h1>
          <p>Seu código de redefinição de senha é:</p>
          <p><strong>${token}</strong></p>
        </body>
        </html>
      `;
      const info = await transporter.sendMail({
        to: userEmail,
        subject: "Código de redefinição de senha.",
        html: htmlContent,
      });
      return info;
    } catch (error: any) {
      throw new HTTPException(500, {
        message: "Falha ao enviar e-mail de redefinição de senha.",
      });
    }
  }
}

export default new Mailer();
