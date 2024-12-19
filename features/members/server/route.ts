import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { APIResponse } from "@/helper/apiResponse";
import db from "@/lib/db";
import { Session } from "@/types/auth";

const app = new Hono<{
  Variables: {
    user: Session["user"] | null;
    session: Session["session"] | null;
  };
}>()
  .post(
    "/current-member",
    zValidator(
      "json",
      z.object({
        workspaceId: z.string(),
      })
    ),
    async (c) => {
      try {
        const { workspaceId } = c.req.valid("json");
        const userId = c.get("user")?.id;

        if (!userId) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }

        const member = await db.echoMember.findFirst({
          where: {
            userId,
            workspaceId,
          },
        });

        return c.json(new APIResponse(200, "Got current member", member), 200);
      } catch (error) {
        return c.json(new APIResponse(500, "Internal server error", null), 500);
      }
    }
  )
  .post(
    "get-by-id",
    zValidator(
      "json",
      z.object({
        id: z.string(),
      })
    ),
    async (c) => {
      try {
        const { id } = c.req.valid("json");
        const userId = c.get("user")?.id;

        if (!userId) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }

        const member = await db.echoMember.findUnique({
          where: {
            id,
          },
        });
        return c.json(new APIResponse(200, "Got member by id", member), 200);
      } catch (error) {
        return c.json(new APIResponse(500, "Internal server error", null), 500);
      }
    }
  )
  .post(
    "get-all",
    zValidator(
      "json",
      z.object({
        workspaceId: z.string(),
      })
    ),
    async (c) => {
      try {
        const { workspaceId } = c.req.valid("json");
        const userId = c.get("user")?.id;
        if (!userId) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }

        const members = await db.echoMember.findMany({
          where: {
            workspaceId,
          },
        });

        const users = await db.user.findMany({
          where: {
            id: { in: members.map((member) => member.userId) },
          },
        });
        return c.json(new APIResponse(200, "Got all members", users), 200);
      } catch (error) {
        return c.json(new APIResponse(500, "Internal server error", null), 500);
      }
    }
  )
  .post(
    "remove-member",
    zValidator("json", z.object({ id: z.string() })),
    async (c) => {
      try {
        const { id } = c.req.valid("json");
        const userId = c.get("user")?.id;

        if (!userId) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }
        const member = await db.echoMember.findUnique({
          where: {
            id,
          },
        });
        if (!member) {
          return c.json(new APIResponse(404, "Member not found", null), 404);
        }
        const currentMember = await db.echoMember.findFirst({
          where: {
            userId,
            workspaceId: member.workspaceId,
          },
        });
        if (!currentMember) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }
        if (member.role === "admin") {
          return c.json(
            new APIResponse(400, "Admin cannot be removed", null),
            400
          );
        }
        if (currentMember.id === id && currentMember.role === "admin") {
          return c.json(
            new APIResponse(400, "Cannot remove if self is an admin", null),
            400
          );
        }
        await db.echoMember.delete({
          where: {
            id,
          },
        });
        return c.json(new APIResponse(200, "Removed member", null), 200);
      } catch (error) {
        return c.json(new APIResponse(500, "Internal server error", null), 500);
      }
    }
  )
  .post(
    "update-member",
    zValidator(
      "json",
      z.object({ id: z.string(), role: z.enum(["admin", "member"]) })
    ),
    async (c) => {
      try {
        const { id, role } = c.req.valid("json");
        const userId = c.get("user")?.id;

        if (!userId) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }
        const member = await db.echoMember.findUnique({
          where: {
            id,
          },
        });
        if (!member) {
          return c.json(new APIResponse(404, "Member not found", null), 404);
        }
        const currentMember = await db.echoMember.findFirst({
          where: {
            userId,
            workspaceId: member.workspaceId,
          },
        });
        if (!currentMember) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }
        if (currentMember.role !== "admin") {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }
        await db.echoMember.update({
          where: {
            id,
          },
          data: {
            role,
          },
        });
        return c.json(new APIResponse(200, "Updated member", null), 200);
      } catch (error) {
        return c.json(new APIResponse(500, "Internal server error", null), 500);
      }
    }
  );

export default app;
