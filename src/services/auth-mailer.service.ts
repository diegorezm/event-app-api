import { ForbiddenError } from "../types";
import sendEmail from "../utils/mail";
import { IOtpService } from "./otp.service";
import { IUserService } from "./user.service";

const mailTemplate = ({
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
  </head>
  <body>
    <h1>${title}</h1>

    <p><strong>Token:</strong> ${token}</p>
    <p>${obs ?? ""}</p>
  </body>
  </html>
`;
};

export interface IAuthMailerService {
  sendPasswordResetEmail(email: string): Promise<void>;
  sendEmailVerification(email: string): Promise<void>;
  verifyEmail(token: string, email: string): Promise<void>;
  resetPassword(token: string, email: string, newPassword: string): Promise<void>;
}

export class AuthMailerService implements IAuthMailerService {
  constructor(private readonly otpService: IOtpService, private readonly userService: IUserService) { }

  async sendEmailVerification(email: string): Promise<void> {
    const user = await this.userService.getByEmail(email);
    const otp = await this.otpService.create({
      userId: user.id,
      operation: "EMAIL_VERIFICATION",
    });
    const mail = mailTemplate({
      title: "Verificação de email",
      token: otp.otp,
      obs: "Copie e cole o token.",
    });

    await sendEmail({
      to: email,
      subject: "Verificação de email",
      content: mail,
    });
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userService.getByEmail(email);
    const otp = await this.otpService.create({
      userId: user.id,
      operation: "PASSWORD_RESET",
    });
    const mail = mailTemplate({
      title: "Recuperação de senha",
      token: otp.otp,
      obs: "Copie e cole o token. Caso não tenha sido você que solicitou a recuperação de senha, ignore este email.",
    });

    await sendEmail({
      to: email,
      subject: "Recuperação de senha",
      content: mail,
    });
  }

  async verifyEmail(token: string, email: string): Promise<void> {
    const user = await this.userService.getByEmail(email);
    const isValidOtp = await this.otpService.verify({
      userId: user.id,
      operation: "EMAIL_VERIFICATION",
      otp: token,
    })
    if (!isValidOtp) {
      throw new ForbiddenError("Código inválido.");
    }
    await this.userService.update(user.id, {
      verified: true
    });
  }

  async resetPassword(token: string, email: string, newPassword: string): Promise<void> {
    const user = await this.userService.getByEmail(email);
    const isValidOtp = await this.otpService.verify({
      userId: user.id,
      operation: "PASSWORD_RESET",
      otp: token,
    })
    if (!isValidOtp) {
      throw new ForbiddenError("Código inválido.");
    }
    await this.userService.update(user.id, {
      password: newPassword,
    });
  }
}