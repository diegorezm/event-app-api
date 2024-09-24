import { HTTPException } from "hono/http-exception";
import {
  UserOtp,
  UserOtpDTO,
  UserOtpOperation,
  UserOtpStatus,
} from "../models/user/otp";
import crypto from "../utils/crypto";
import { IOtpRepository } from "../repositories/otp.repository";
import { IUserRepository } from "../repositories/user.repository";
import { ForbiddenError, InternalServerError, NotFoundError } from "../types";

type GetOtpParams = {
  id: number;
  status?: UserOtpStatus;
  operation?: UserOtpOperation;
}

type GetOtpByUserIdParams = {
  id: string;
  status?: UserOtpStatus;
  operation?: UserOtpOperation;
}

type VerifyOtpParams = {
  userId: string;
  otp: string;
  operation: UserOtpOperation;
}

export interface IOtpService {
  getById(params: GetOtpParams): Promise<UserOtp | undefined>;
  getByUserId(params: GetOtpByUserIdParams): Promise<UserOtp | undefined>;
  create(payload: UserOtpDTO): Promise<UserOtp>;
  updateStatus(id: number, status: UserOtpStatus): Promise<UserOtp>;
  delete(id: number): Promise<void>;
  deleteByUserId(id: string): Promise<void>;
  deleteAll(): Promise<void>;
  verify(params: VerifyOtpParams): Promise<boolean>;
}

export default class OtpService implements IOtpService {
  private readonly EXPIRATION_TIME = 15 * 60 * 1000;

  constructor(private readonly otpRepository: IOtpRepository, private readonly userRepository: IUserRepository) { }

  // generate otp code, encrypt and return
  private generateOtpCode() {
    const digits = String(Math.floor(1000 + Math.random() * 9000));
    const token = crypto.encrypt(digits);
    if (token === undefined) {
      throw new HTTPException(500, {
        message: "Não foi possivel gerar o token.",
      });
    }
    return token;
  }

  async getById({
    id,
    status,
    operation,
  }: GetOtpParams): Promise<UserOtp> {
    const data = await this.otpRepository.getById({
      id,
      status,
      operation,
    });
    if (!data) {
      throw new NotFoundError("OTP não encontrado.");
    }
    return data;
  }

  async getByUserId({
    id,
    status,
    operation,
  }: GetOtpByUserIdParams): Promise<UserOtp> {
    const data = await this.otpRepository.getByUserId({
      id,
      status,
      operation,
    });
    if (!data) {
      throw new NotFoundError("OTP não encontrado.");
    }
    return data;
  }

  async create(payload: UserOtpDTO): Promise<UserOtp> {
    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado.");
    }

    const otp = this.generateOtpCode();
    if (otp === undefined) {
      throw new InternalServerError("Não foi possivel gerar o token.");
    }
    const expiresAt = new Date(Date.now() + this.EXPIRATION_TIME);
    const data = await this.otpRepository.create({
      userId: payload.userId,
      status: payload.status ?? "PENDING",
      operation: payload.operation,
      otp,
      expiresAt,
      createdAt: new Date(),
    });
    return data;
  }

  // update status of otp
  // available status: PENDING, SUCCESS, EXPIRED
  async updateStatus(id: number, status: UserOtpStatus): Promise<UserOtp> {
    const data = await this.otpRepository.updateStatus(id, status);
    if (!data) {
      throw new NotFoundError("OTP não encontrado.");
    }
    return data;
  }

  // verify if the otp code is valid
  async verify({
    userId,
    otp,
    operation,
  }: VerifyOtpParams): Promise<boolean> {
    const data = await this.otpRepository.getByUserId({
      id: userId,
      operation,
    });
    if (data === undefined) {
      throw new NotFoundError("Token não encontrado.");
    }
    const token = crypto.decrypt(data.otp);
    if (token === undefined) {
      throw new InternalServerError("Não foi possivel validar o token.");
    }
    if (token === otp) {
      if (data.status === "EXPIRED" || data.expiresAt < new Date()) {
        await this.updateStatus(data.id, "EXPIRED");
        throw new ForbiddenError("Token expirado.");
      }
      if (data.status === "SUCCESS") {
        throw new ForbiddenError("Token já utilizado.");
      }
      await this.updateStatus(data.id, "SUCCESS");
      return true;
    }
    return false;
  }

  async delete(id: number) {
    const otp = await this.otpRepository.getById({
      id,
    });
    if (!otp) {
      throw new NotFoundError("OTP não encontrado.");
    }
    if (otp.status === "PENDING" && otp.expiresAt > new Date()) {
      throw new ForbiddenError("Não é possivel remover este registro no momento.");
    }
    await this.otpRepository.delete(id);
  }

  async deleteByUserId(id: string) {
    await this.otpRepository.deleteByUserId(id);
  }

  // delete all invalids/expired otps
  async deleteAll(): Promise<void> {
    await this.otpRepository.deleteAll();
  }
}