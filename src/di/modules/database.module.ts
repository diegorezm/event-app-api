import db from "../../db";
import {ContainerModule, interfaces} from "inversify";
import {DI_SYMBOLS} from "../types";
import {NodePgDatabase} from "drizzle-orm/node-postgres";

const initializeModule = (bind: interfaces.Bind) => {
  bind<NodePgDatabase>(DI_SYMBOLS.NodePgDatabase).toConstantValue(db);
}

export const DatabaseModule = new ContainerModule(initializeModule)
