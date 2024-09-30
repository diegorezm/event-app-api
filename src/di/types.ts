import {NodePgDatabase} from "drizzle-orm/node-postgres";
import {IEventRepository} from "../repositories/event.repository";
import {IOtpRepository} from "../repositories/otp.repository";
import {IUserRepository} from "../repositories/user.repository";
import {IAuthMailerService} from "../services/auth-mailer.service";
import {IAuthService} from "../services/auth.service";
import {IEventService} from "../services/event.service";
import {IOtpService} from "../services/otp.service";
import {IUserService} from "../services/user.service";

export const DI_SYMBOLS = {
  // repositories
  IUserRepository: Symbol("IUserRepository"),
  IOtpRepository: Symbol("IOtpRepository"),
  IEventRepository: Symbol("IEventRepository"),
  //services
  IUserService: Symbol("IUserService"),
  IOTPService: Symbol("IOTPService"),
  IAuthMailerService: Symbol("IAuthMailerService"),
  IAuthService: Symbol("IAuthService"),
  IEventService: Symbol("IEventService"),
  NodePgDatabase: Symbol("NodePgDatabase"),

} as const;

export interface DI_RETURN_TYPES {
  IUserRepository: IUserRepository
  IOtpRepository: IOtpRepository
  IEventRepository: IEventRepository
  IUserService: IUserService
  IOTPService: IOtpService
  IAuthMailerService: IAuthMailerService
  IAuthService: IAuthService
  IEventService: IEventService
  NodePgDatabase: NodePgDatabase
}

