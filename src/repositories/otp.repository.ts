import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { UserOtp, UserOtpDTO, UserOtpOperation, UserOtpStatus } from "../models/user/otp";
import { userOtpSchema } from "../db/schema";
import { and, eq, or, sql } from "drizzle-orm";

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

export interface IOtpRepository {
  getById(params: GetOtpParams): Promise<UserOtp | undefined>;
  getByUserId(params: GetOtpByUserIdParams): Promise<UserOtp | undefined>;
  create(payload: Omit<UserOtp, "id">): Promise<UserOtp>;
  update(id: number, payload: UserOtpDTO): Promise<UserOtp>;
  updateStatus(id: number, status: UserOtpStatus): Promise<UserOtp>;
  delete(id: number): Promise<void>;
  deleteByUserId(id: string): Promise<void>;
  deleteAll(): Promise<void>;
}

export default class OtpRepository implements IOtpRepository {
  constructor(private readonly db: NodePgDatabase) { }

  async getById(params: GetOtpParams): Promise<UserOtp | undefined> {
    const conditions = [
      eq(userOtpSchema.id, params.id),
      eq(userOtpSchema.status, params.status ? params.status : "PENDING"),
      sql`${userOtpSchema.expiresAt} > now()`,
    ];

    if (params.operation) {
      conditions.push(eq(userOtpSchema.operation, params.operation));
    }

    const [otp] = await this.db.select().from(userOtpSchema).where(and(...conditions));
    return otp;
  }

  async getByUserId(params: GetOtpByUserIdParams): Promise<UserOtp | undefined> {
    const conditions = [
      eq(userOtpSchema.userId, params.id),
      eq(userOtpSchema.status, params.status ? params.status : "PENDING"),
      sql`${userOtpSchema.expiresAt} > now()`,
    ];

    if (params.operation) {
      conditions.push(eq(userOtpSchema.operation, params.operation));
    }

    const [otp] = await this.db.select().from(userOtpSchema).where(and(...conditions));
    return otp;
  }

  async create(payload: Omit<UserOtp, "id">): Promise<UserOtp> {
    const [otp] = await this.db.insert(userOtpSchema).values(payload).returning();
    return otp;
  }

  async update(id: number, payload: UserOtpDTO): Promise<UserOtp> {
    const [otp] = await this.db
      .update(userOtpSchema)
      .set(payload)
      .where(eq(userOtpSchema.id, id))
      .returning();
    return otp;
  }

  async updateStatus(id: number, status: UserOtpStatus): Promise<UserOtp> {
    const [otp] = await this.db.update(userOtpSchema).set({ status }).where(eq(userOtpSchema.id, id)).returning();
    return otp;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(userOtpSchema).where(eq(userOtpSchema.id, id));
  }

  async deleteByUserId(id: string): Promise<void> {
    await this.db.delete(userOtpSchema).where(eq(userOtpSchema.userId, id));
  }

  async deleteAll(): Promise<void> {
    await this.db.delete(userOtpSchema).where(
      or(
        eq(userOtpSchema.status, "EXPIRED"),
        eq(userOtpSchema.status, "SUCCESS"),
      ),
    );
  }
}