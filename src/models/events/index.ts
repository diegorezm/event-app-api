import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { eventsTableSchema } from "../../db/schema";
import { z } from "zod";

export const eventsSelectSchema = createSelectSchema(eventsTableSchema);
export const eventsInsertSchema = createInsertSchema(eventsTableSchema, {
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres",
  }),
  description: z.string().min(3, {
    message: "A descrição deve ter pelo menos 3 caracteres",
  }).optional(),
  location: z.string().min(3, {
    message: "A localização deve ter pelo menos 3 caracteres",
  }),
  startTime: z.date({
    required_error: "A data de início é obrigatória",
    invalid_type_error: "A data de início deve ser uma data válida",
  }).refine((data) => data > new Date(), {
    message: "A data de início deve ser maior que a data atual",
  }),
  endTime: z.date({
    required_error: "A data de término é obrigatória",
    invalid_type_error: "A data de término deve ser uma data válida",
  }).refine((data) => data > new Date(), {
    message: "A data de término deve ser maior que a data de início",
  }),
  totalTickets: z.number().int().positive({
    message: "O número total de ingressos deve ser um número inteiro positivo",
  }),
  createdBy: z.string().uuid({
    message: "O ID do criador deve ser um UUID válido.",
  }),
}).omit({
  id: true,
  createdAt: true,
});

export type Event = z.infer<typeof eventsSelectSchema>;
export type EventDTO = z.infer<typeof eventsInsertSchema>;