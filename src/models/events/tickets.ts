import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { ticketsTableSchema } from "../../db/schema"
import { z } from "zod"

export const ticketsSelectSchema = createSelectSchema(ticketsTableSchema)
export const ticketsInsertSchema = createInsertSchema(ticketsTableSchema, {
  eventId: z.string().uuid({
    message: "Event ID deve ser um UUID válido",
  }),
  buyerId: z.string().uuid({
    message: "Buyer ID deve ser um UUID válido",
  }),
  qrCode: z.string({
    message: "QR Code é obrigatório",
  }),

}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type Ticket = z.infer<typeof ticketsSelectSchema>
export type TicketDTO = z.infer<typeof ticketsInsertSchema>