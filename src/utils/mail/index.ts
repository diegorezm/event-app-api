import { transporter } from "../../config/mail";
import { HTTPException } from "hono/http-exception";
import userService from "../../services/user-service";
import otpService from "../../services/otp-service";
import crypto from "../crypto";
import { MAIL_USER } from "../../env";
import db from "../../db";
import { userTableSchema } from "../../db/schema";
import { eq } from "drizzle-orm";
import { User } from "../../models/user";

const template = ({
  title,
  obs,
  token,
}: {
  title: string;
  token: string;
  obs?: string;
}) => {
  return `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${title}</title>
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
              <h1>${title}</h1>
              <h2>Código</h2>
              <pre class="code-block">
                <code>${token}</code>
              </pre>
              ${obs}
            </body>
            </html>
      `;
};

class Mailer {
  async sendVerificationEmail(userEmail: string) {
    try {
      const userExists = await userService.getByEmail(userEmail);
      if (!userExists) {
        throw new HTTPException(404);
      }

      if (userExists.verified) {
        throw new HTTPException(403, {
          message: "Usuário já esta verificado.",
        });
      }

      const token = await otpService.create({
        userId: userExists.id,
        operation: "EMAIL_VERIFICATION",
      });
      const otp = crypto.decrypt(token.otp);

      if (otp === undefined) {
        throw new HTTPException(500, {
          message: "Não foi possivel gerar este token.",
        });
      }

      const info = await transporter.sendMail({
        from: MAIL_USER,
        to: userEmail,
        subject: "Código de verificação.",
        html: template({ title: "Verificação de email", token: otp }),
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
        throw new HTTPException(404, {
          message: "Usuário não existe.",
        });
      }
      const token = await otpService.create({
        operation: "PASSWORD_RESET",
        userId: userExists.id,
      });

      const otp = crypto.decrypt(token.otp);

      if (otp === undefined) {
        throw new HTTPException(500, {
          message: "Não foi possivel gerar este token.",
        });
      }
      const obs =
        "<p>Se você não solicitou esta redefinição de senha, por favor, ignore este e-mail e, se necessário, solicite uma redefinição de senha para garantir a segurança de sua conta.</p>";
      const info = await transporter.sendMail({
        from: MAIL_USER,
        to: userEmail,
        subject: "Código de redefinição de senha.",
        html: template({
          title: "Redefinição de senha",
          token: otp,
          obs,
        }),
      });
      return info;
    } catch (error: any) {
      throw new HTTPException(500, {
        message:
          error.message ?? "Falha ao enviar e-mail de redefinição de senha.",
      });
    }
  }

  async emailVerificationOtp(userEmail: string, otp: string) {
    try {
      const userExists = await userService.getByEmail(userEmail);
      if (!userExists) {
        throw new HTTPException(404, {
          message: "Email inválido.",
        });
      }
      const token = await otpService.verify({
        userId: userExists.id,
        otp,
        operation: "EMAIL_VERIFICATION",
      });

      if (!token) {
        throw new HTTPException(403, {
          message: "Erro!",
        });
      }
      const user = await userService.update(userExists.id, { verified: true });
      return {
        user,
      };
    } catch (error: any) {
      throw error();
    }
  }

  async passwordResetOtp(newPassword: string, userEmail: string, otp: string) {
    const userExists = await userService.getByEmail(userEmail);
    if (!userExists) {
      throw new HTTPException(404, {
        message: "Email inválido.",
      });
    }

    if (userExists.verified === false) {
      throw new HTTPException(403);
    }
    const token = await otpService.verify({
      userId: userExists.id,
      otp,
      operation: "PASSWORD_RESET",
    });

    if (!token) {
      throw new HTTPException(403);
    }
    const hash = crypto.encrypt(newPassword);
    if (hash === undefined) {
      throw new HTTPException(500, {
        message: "Não foi possivel redefinir a senha.",
      });
    }
    try {
      const [user] = await db
        .update(userTableSchema)
        .set({ password: hash })
        .where(eq(userTableSchema.id, userExists.id))
        .returning();
      return { user: user as User };
    } catch (error) {
      throw new HTTPException(500, {
        message: "Não foi possivel redefinir a senha.",
      });
    }
  }
}

export default new Mailer();
