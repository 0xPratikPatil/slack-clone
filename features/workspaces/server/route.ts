import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { APIResponse } from "@/helper/apiResponse";
import db from "@/lib/db";
import { Session } from "@/types/auth";

const joinEchoWorkspaceSchema = z.object({
  joinCode: z.string(),
  workspaceId: z.string(),
});

const createEchoWorkspaceSchema = z.object({
  name: z.string(),
});

const updateEchoWorkspaceSchema = z.object({
  workspaceId: z.string(),
  name: z.string(),
});

const removeEchoWorkspaceSchema = z.object({
  workspaceId: z.string(),
});

const newJoinCodeSchema = z.object({
  workspaceId: z.string(),
});

const getInfoIdSchema = z.object({
  workspaceId: z.string(),
});

const getByIdSchema = z.object({
  workspaceId: z.string(),
});

const generateCode = () => {
  const code = Array.from(
    { length: 6 },
    () => "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
  ).join("");

  return code;
};

const app = new Hono<{
  Variables: {
    user: Session["user"] | null;
    session: Session["session"] | null;
  };
}>()
  .post("/join", zValidator("json", joinEchoWorkspaceSchema), async (c) => {
    try {
      const { joinCode, workspaceId } = c.req.valid("json");
      const userId = await c.get("user")?.id;

      if (!userId) {
        return c.json(new APIResponse(401, "Unauthorized access", null), 401);
      }
      const workspace = await db.echoWorkspace.findUnique({
        where: {
          id: workspaceId,
        },
      });

      if (!workspace) {
        return c.json(new APIResponse(404, "Workspace not found", null), 404);
      }

      if (workspace.joinCode !== joinCode.toLowerCase()) {
        return c.json(new APIResponse(400, "Invalid join code", null), 400);
      }

      const existingMember = await db.echoMember.findFirst({
        where: {
          userId,
          workspaceId,
        },
      });

      if (existingMember) {
        return c.json(
          new APIResponse(400, "Already a member of this workspace", null),
          400
        );
      }

      await db.echoMember.create({
        data: {
          userId,
          workspaceId,
          role: "member",
        },
      });

      return c.json(new APIResponse(200, "Joined workspace", null), 200);
    } catch (error) {
      return c.json(new APIResponse(500, "Internal server error", null), 500);
    }
  })
  .post(
    "/create-workspace",
    zValidator("json", createEchoWorkspaceSchema),
    async (c) => {
      try {
        const { name } = c.req.valid("json");
        const userId = await c.get("user")?.id;

        if (!userId) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }

        const joinCode = generateCode();
        const workspace = await db.echoWorkspace.create({
          data: {
            name,
            joinCode,
            userId,
          },
        });

        await db.echoMember.create({
          data: {
            userId,
            workspaceId: workspace.id,
            role: "admin",
          },
        });

        await db.echoChannel.create({
          data: {
            name: "general",
            workspaceId: workspace.id,
          },
        });

        return c.json(
          new APIResponse(200, "Created workspace", workspace.id),
          200
        );
      } catch (error) {
        return c.json(new APIResponse(500, "Internal server error", null), 500);
      }
    }
  )
  .patch(
    "/update-workspace",
    zValidator("json", updateEchoWorkspaceSchema),
    async (c) => {
      try {
        const { workspaceId, name } = c.req.valid("json");
        const userId = await c.get("user")?.id;

        if (!userId) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }

        const member = await db.echoMember.findFirst({
          where: {
            userId,
            workspaceId,
          },
        });

        if (!member || member.role !== "admin") {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }

        await db.echoWorkspace.update({
          where: {
            id: workspaceId,
          },
          data: {
            name,
          },
        });

        return c.json(new APIResponse(200, "Updated workspace", null), 200);
      } catch (error) {
        return c.json(new APIResponse(500, "Internal server error", null), 500);
      }
    }
  )
  .delete(
    "/remove-workspace",
    zValidator("json", removeEchoWorkspaceSchema),
    async (c) => {
      try {
        const { workspaceId } = c.req.valid("json");
        const userId = await c.get("user")?.id;

        if (!userId) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }

        const member = await db.echoMember.findFirst({
          where: {
            userId,
            workspaceId,
          },
        });

        if (!member || member.role !== "admin") {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }

        await db.echoWorkspace.delete({
          where: {
            id: workspaceId,
          },
        });

        return c.json(new APIResponse(200, "Removed workspace", null), 200);
      } catch (error) {
        return c.json(new APIResponse(500, "Internal server error", null), 500);
      }
    }
  )
  .post("/new-join-code", zValidator("json", newJoinCodeSchema), async (c) => {
    try {
      const { workspaceId } = c.req.valid("json");
      const userId = await c.get("user")?.id;

      if (!userId) {
        return c.json(new APIResponse(401, "Unauthorized access", null), 401);
      }
      const member = await db.echoMember.findFirst({
        where: {
          userId,
          workspaceId,
        },
      });

      if (!member || member.role !== "admin") {
        return c.json(new APIResponse(401, "Unauthorized access", null), 401);
      }

      const joinCode = generateCode();

      await db.echoWorkspace.update({
        where: {
          id: workspaceId,
        },
        data: {
          joinCode,
        },
      });

      return c.json(new APIResponse(200, "Generated new join code", null), 200);
    } catch (error) {
      return c.json(new APIResponse(500, "Internal server error", null), 500);
    }
  })
  .post("/get-info-id", zValidator("json", getInfoIdSchema), async (c) => {
    try {
      const { workspaceId } = c.req.valid("json");
      const userId = await c.get("user")?.id;

      if (!userId) {
        return c.json(new APIResponse(401, "Unauthorized access", null), 401);
      }

      const member = await db.echoMember.findFirst({
        where: {
          userId,
          workspaceId,
        },
      });

      const workspace = await db.echoWorkspace.findUnique({
        where: {
          id: workspaceId,
        },
      });

      if (!workspace) {
        return c.json(new APIResponse(404, "Workspace not found", null), 404);
      }

      return c.json(
        new APIResponse(200, "Got workspace info", {
          name: workspace?.name,
          isMember: !!member,
          role: member?.role,
        }),
        200
      );
    } catch (error) {
      return c.json(new APIResponse(500, "Internal server error", null), 500);
    }
  })
  .post("/get-by-id", zValidator("json", getByIdSchema), async (c) => {
    try {
      const { workspaceId } = c.req.valid("json");
      const userId = await c.get("user")?.id;

      if (!userId) {
        return c.json(new APIResponse(401, "Unauthorized access", null), 401);
      }

      const member = await db.echoMember.findFirst({
        where: {
          userId,
          workspaceId,
        },
      });

      if (!member) {
        return c.json(new APIResponse(401, "Unauthorized access", null), 401);
      }
      const workspace = await db.echoWorkspace.findUnique({
        where: {
          id: workspaceId,
        },
      });
      return c.json(new APIResponse(200, "Got workspace", workspace), 200);
    } catch (error) {
      return c.json(new APIResponse(500, "Internal server error", null), 500);
    }
  })
  .post("/get-all", async (c) => {
    try {
      const userId = await c.get("user")?.id;

      if (!userId) {
        return c.json(new APIResponse(401, "Unauthorized access", null), 401);
      }

      const members = await db.echoMember.findMany({
        where: {
          userId,
        },
      });

      const workspaceIds = members.map((member) => member.workspaceId);

      const workspaces = await db.echoWorkspace.findMany({
        where: {
          id: { in: workspaceIds },
        },
      });

      return c.json(
        new APIResponse(200, "Got all workspaces", workspaces),
        200
      );
    } catch (error) {
      return c.json(new APIResponse(500, "Internal server error", null), 500);
    }
  });

export default app;
