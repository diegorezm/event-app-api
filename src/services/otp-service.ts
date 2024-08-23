import { HTTPException } from "hono/http-exception";
import db from "../db";
import { userOtpSchema } from "../db/schema";
import {
  UserOtp,
  UserOtpDTO,
  UserOtpOperation,
  UserOtpStatus,
} from "../models/user/otp";
import userService from "./user-service";
import { and, eq, or, sql } from "drizzle-orm";
import crypto from "../utils/crypto";

class OtpService {
  generate() {
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
  }: {
    id: number;
    status?: UserOtpStatus;
    operation?: UserOtpOperation;
  }): Promise<UserOtp | undefined> {
    const conditions = [
      eq(userOtpSchema.id, id),
      eq(userOtpSchema.status, status ? status : "PENDING"),
      sql`${userOtpSchema.expiresAt} > now()`,
    ];

    if (operation) {
      conditions.push(eq(userOtpSchema.operation, operation));
    }

    const [data] = await db
      .select()
      .from(userOtpSchema)
      .where(and(...conditions));
    return data;
  }

  async getByUserId({
    id,
    status,
    operation,
  }: {
    id: string;
    status?: UserOtpStatus;
    operation?: UserOtpOperation;
  }): Promise<UserOtp | undefined> {
    const conditions = [
      eq(userOtpSchema.userId, id),
      eq(userOtpSchema.status, status ? status : "PENDING"),
      sql`${userOtpSchema.expiresAt} > now()`,
    ];

    if (operation) {
      conditions.push(eq(userOtpSchema.operation, operation));
    }

    const [data] = await db
      .select()
      .from(userOtpSchema)
      .where(and(...conditions));
    return data;
  }

  async create(payload: UserOtpDTO): Promise<UserOtp> {
    const user = await userService.getById(payload.userId);
    if (!user) {
      throw new HTTPException(404, {
        message: "Usuário não encontrado.",
      });
    }
    const otp = this.generate();
    if (otp === undefined) {
      throw new HTTPException(500, {
        message: "Não foi possivel gerar o token.",
      });
    }
    const [data] = await db
      .insert(userOtpSchema)
      .values({ ...payload, otp })
      .returning();
    return data;
  }

  async update(id: number, status: UserOtpStatus): Promise<UserOtp> {
    const [data] = await db
      .update(userOtpSchema)
      .set({ status })
      .where(eq(userOtpSchema.id, id))
      .returning();

    if (!data) {
      throw new HTTPException(404, {
        message: "Usuário não encontrado.",
      });
    }
    return data;
  }

  async delete(id: number) {
    const otp = await this.getById({ id });
    if (otp === undefined) {
      throw new HTTPException(404, {
        message: "OTP não encontrado.",
      });
    }
    if (otp.status === "PENDING" && otp.expiresAt > new Date()) {
      throw new HTTPException(403, {
        message: "Não é possivel remover este registro no momento.",
      });
    }
    try {
      await db.delete(userOtpSchema).where(eq(userOtpSchema.id, id));
    } catch (error) {
      throw new HTTPException(500, {
        message: "Erro ao remover o registro.",
      });
    }
  }

  async deleteAll(): Promise<void> {
    await db
      .delete(userOtpSchema)
      .where(
        or(
          eq(userOtpSchema.status, "EXPIRED"),
          eq(userOtpSchema.status, "SUCCESS"),
        ),
      );
  }

  async verify({
    userId,
    otp,
    operation,
  }: {
    userId: string;
    otp: string;
    operation: UserOtpOperation;
  }): Promise<boolean> {
    const data = await this.getByUserId({
      id: userId,
      operation,
    });
    if (data === undefined) {
      throw new HTTPException(404, {
        message: "Token não encontrado.",
      });
    }
    const token = crypto.decrypt(data.otp);
    if (token === undefined) {
      throw new HTTPException(500, {
        message: "Não foi possivel validar o token.",
      });
    }
    if (token === otp) {
      await this.update(data.id, "SUCCESS");
      return true;
    }
    return false;
  }
}
export default new OtpService();
