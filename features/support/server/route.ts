import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { submitTicketFormSchema } from "@/schemas/settings";
import db from "@/lib/db";
import { Session } from "@/types/auth";
import APIResponse from "@/helper/apiResponse";

const app = new Hono<{
  Variables: {
    user: Session["user"] | null;
    session: Session["session"] | null;
  };
}>()
  .post(
    "/submit-ticket",
    zValidator("json", submitTicketFormSchema),
    async (c) => {
      try {
        const { category, subject, message, priority } = c.req.valid("json");
        const userId = await c.get("user")?.id;

        if (!userId) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }

        await db.ticket.create({
          data: { userId, category, subject, message, priority, status:"Open" },
        });

        return c.json(
          new APIResponse(200, "Ticket submitted successfully.", null),
          200
        );
      } catch (error) {
        return c.json(
          new APIResponse(500, "Failed to submit ticket", null),
          500
        );
      }
    }
  )
  .post("/get-tickets", async (c) => {
    try {
      const session = await c.req.json<Session>();
      const userId = session.session.userId;
      if (!userId) {
        return c.json(new APIResponse(401, "Unauthorized access", null), 401);
      }
      const ticketsData = await db.ticket.findMany({
        where: { userId },
      });

      return c.json(
        new APIResponse(200, "Ticket submitted successfully.", ticketsData),
        200
      );
    } catch (error) {
      return c.json(new APIResponse(500, "Failed to submit ticket", null), 500);
    }
  });
export default app;
