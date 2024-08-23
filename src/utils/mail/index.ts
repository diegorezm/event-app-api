import { transporter } from "../../config/mail";
import tokenService from "../../services/token-service";
import { HTTPException } from "hono/http-exception";
import userService from "../../services/user-service";

class Mailer {
  async sendVerificationEmail(userEmail: string) {
    try {
      const userExists = await userService.getByEmail(userEmail);
      if (!userExists) {
        throw new HTTPException(401);
      }

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
              <title>Redefinição de Senha</title>
              <style>
                .code-block {
                  font-family: monospace;
                  background-color: #f4f4f4;
                  border: 1px solid #ddd;
                  padding: 10px;
                  border-radius: 4px;
                  overflow-wrap: break-word;
                  word-wrap: break-word;
                  white-space: pre-wrap;
                  word-break: break-all;
                }

                code {
                  display: block;
                  white-space: pre-wrap;
                }
              </style>
            </head>

            <body>
              <h1>Redefinição de Senha</h1>
              <p>Se você não solicitou esta redefinição de senha, por favor, ignore este e-mail e, se necessário, solicite uma
                redefinição de senha para garantir a segurança de
                sua conta.</p>
              <h2>Código de redefinição de senha</h2>
              <pre class="code-block">
            <code>${token}</code>
              </pre>
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
      const userExists = await userService.getByEmail(userEmail);
      if (!userExists) {
        throw new HTTPException(401);
      }
      const token = await tokenService.sign({
        email: userEmail,
        type: "password_reset",
      });

      const htmlContent = `
            <html lang="pt-BR">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Redefinição de Senha</title>
              <style>
                .code-block {
                  font-family: monospace;
                  background-color: #f4f4f4;
                  border: 1px solid #ddd;
                  padding: 10px;
                  border-radius: 4px;
                  overflow-wrap: break-word;
                  word-wrap: break-word;
                  white-space: pre-wrap;
                  word-break: break-all;
                }
                code {
                  display: block;
                  white-space: pre-wrap;
                }
              </style>
            </head>
            <body>
              <h1>Redefinição de Senha</h1>
              <p>Se você não solicitou esta redefinição de senha, por favor, ignore este e-mail e, se necessário, solicite uma
                redefinição de senha para garantir a segurança de
                sua conta.</p>
              <h2>Código de redefinição de senha</h2>
              <pre class="code-block">
            <code>${token}</code>
              </pre>
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
