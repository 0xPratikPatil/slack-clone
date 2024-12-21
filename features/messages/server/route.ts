import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { APIResponse } from "@/helper/apiResponse";
import db from "@/lib/db";
import { Session } from "@/types/auth";
import { EchoReaction } from "@prisma/client";

const createMessageSchema = z.object({
  body: z.string(),
  image: z.optional(z.string()),
  workspaceId: z.string(),
  channelId: z.optional(z.string()),
  conversationId: z.optional(z.string()),
  parentMessageId: z.optional(z.string()),
});

const getMessagesSchema = z.object({
  channelId: z.string().optional(),
  conversationId: z.string().optional(),
  parentMessageId: z.string().optional(),
  offset: z.number().default(0),
  limit: z.number().default(20),
});

const populateThread = async (messageId: string) => {
  const messages = await prisma.message.findMany({
    where: { parentMessageId: messageId },
  });

  if (messages.length === 0) {
    return { count: 0, image: undefined, timestamp: 0, name: "" };
  }

  const lastMessage = messages[messages.length - 1];
  const lastMessageMember = await db.echoMember.findUnique({
    where: { id: lastMessage.memberId },
    include: { user: true },
  });

  return {
    count: messages.length,
    image: lastMessageMember?.user?.image,
    timestamp: lastMessage.createdAt.getTime(),
    name: lastMessageMember?.user?.name,
  };
};

const populateReactions = async (messageId: string) => {
  const reactions = await db.echoReaction.findMany({
    where: { messageId },
  });

  return reactions.map((reaction) => ({
    ...reaction,
    count: reactions.filter((r) => r.value === reaction.value).length,
  }));
};

const app = new Hono<{
  Variables: {
    user: Session["user"] | null;
    session: Session["session"] | null;
  };
}>()
  .post(
    "/create-message",
    zValidator("json", createMessageSchema),
    async (c) => {
      try {
        const {
          body,
          image,
          workspaceId,
          channelId,
          conversationId,
          parentMessageId,
        } = c.req.valid("json");
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

        let _conversationId = conversationId;

        if (!conversationId && !channelId && parentMessageId) {
          const parentMessage = await db.echoMessage.findUnique({
            where: { id: parentMessageId },
          });
          if (!parentMessage) {
            return c.json(
              new APIResponse(404, "Parent message not found", null),
              404
            );
          }
          _conversationId = parentMessage.conversationId ?? undefined;
        }

        const message = await db.echoMessage.create({
          data: {
            memberId: member.id,
            body,
            image,
            workspaceId,
            conversationId: _conversationId,
            parentMessageId,
          },
        });

        return c.json(new APIResponse(200, "Message created", message.id), 200);
      } catch (error) {
        return c.json(new APIResponse(500, "Internal server error", null), 500);
      }
    }
  )
  .post(
    "/get-by-id",
    zValidator("json", z.object({ id: z.string() })),
    async (c) => {
      try {
        const { id } = c.req.valid("json");
        const userId = await c.get("user")?.id;

        if (!userId) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }
        const message = await db.echoMessage.findUnique({ where: { id } });
        if (!message) {
          return c.json(new APIResponse(404, "Message not found", null), 404);
        }

        const currentMember = await db.echoMember.findFirst({
          where: {
            userId,
            workspaceId: message.workspaceId,
          },
        });

        if (!currentMember) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }
        const member = await db.echoMember.findUnique({
          where: { id: message.memberId },
        });
        if (!member) {
          return c.json(new APIResponse(404, "Member not found", null), 404);
        }
        const user = await db.user.findUnique({ where: { id: member.userId } });
        if (!user) {
          return c.json(new APIResponse(404, "User not found", null), 404);
        }
        const reactions = await db.echoReaction.findMany({
          where: { messageId: id },
        });

        const reactionsWithCounts = reactions.map((reaction) => ({
          ...reaction,
          count: reactions.filter((r) => r.value === reaction.value).length,
        }));

        const dedupedReactions = reactionsWithCounts.reduce(
          (acc, reaction) => {
            const existingReaction = acc.find(
              (r: { value: string }) => r.value === reaction.value
            );

            if (existingReaction) {
              existingReaction.memberIds = Array.from(
                new Set([...existingReaction.memberIds, reaction.memberId])
              );
            } else {
              acc.push({ ...reaction, memberIds: [reaction.memberId] });
            }

            return acc;
          },
          [] as (EchoReaction & {
            count: number;
            memberIds: string[];
          })[]
        );
        const reactionsWithoutMemberIdProperty = dedupedReactions.map(
          ({ memberId, ...rest }) => rest
        );

        return c.json(
          new APIResponse(200, "Message fetched", {
            message,
            member,
            user,
            reactions: reactionsWithoutMemberIdProperty,
          }),
          200
        );
      } catch (error) {
        return c.json(new APIResponse(500, "Internal server error", null), 500);
      }
    }
  )
  .post("/get-all", zValidator("json", getMessagesSchema), async (c) => {
    try {
      const { channelId, conversationId, parentMessageId, offset, limit } =
        getMessagesSchema.parse(await c.req.json());
      // const userId = await c.get("user")?.id;

      // if (!userId) {
      //   return c.json(new APIResponse(401, "Unauthorized access", null), 401);
      // }
      // Fetch messages with pagination
      const messages = await db.echoMessage.findMany({
        where: {
          channelId: channelId || undefined,
          conversationId: conversationId || undefined,
          parentMessageId: parentMessageId || undefined,
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      });

      // Enrich messages with additional data
      const enrichedMessages = await Promise.all(
        messages.map(async (message) => {
          const member = await db.echoMember.findUnique({
            where: { id: message.memberId },
            include: { user: true },
          });

          if (!member || !member.user) return null;

          const reactions = await populateReactions(message.id);
          const thread = await populateThread(message.id);

          return {
            ...message,
            member,
            user: member.user,
            reactions,
            threadCount: thread.count,
            threadImage: thread.image,
            threadName: thread.name,
            threadTimestamp: thread.timestamp,
          };
        })
      );

      // Filter out null values
      const validMessages = enrichedMessages.filter((msg) => msg !== null);

      return c.json(
        new APIResponse(200, "Messages fetched", validMessages),
        200
      );
    } catch (error) {
      return c.json(new APIResponse(500, "Internal server error", null), 500);
    }
  })
  .post(
    "/remove-message",
    zValidator("json", z.object({ id: z.string() })),
    async (c) => {
      try {
        const { id } = c.req.valid("json");
        const userId = await c.get("user")?.id;

        if (!userId) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }
        const message = await db.echoMessage.findUnique({ where: { id } });
        if (!message) {
          return c.json(new APIResponse(404, "Message not found", null), 404);
        }
        const member = await db.echoMember.findFirst({
          where: {
            userId,
            workspaceId: message.workspaceId,
          },
        });
        if (!member || member.id !== message.memberId) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }
        await db.echoMessage.delete({ where: { id } });
        return c.json(new APIResponse(200, "Message removed", null), 200);
      } catch (error) {
        return c.json(new APIResponse(500, "Internal server error", null), 500);
      }
    }
  )
  .post(
    "/update-message",
    zValidator("json", z.object({ id: z.string(), body: z.string() })),
    async (c) => {
      try {
        const { id, body } = c.req.valid("json");
        const userId = await c.get("user")?.id;

        if (!userId) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }
        const message = await db.echoMessage.findUnique({ where: { id } });
        if (!message) {
          return c.json(new APIResponse(404, "Message not found", null), 404);
        }
        const member = await db.echoMember.findFirst({
          where: {
            userId,
            workspaceId: message.workspaceId,
          },
        });
        if (!member || member.id !== message.memberId) {
          return c.json(new APIResponse(401, "Unauthorized access", null), 401);
        }
        await db.echoMessage.update({
          where: { id },
          data: { body, updatedAt: Date.now() },
        });
        return c.json(new APIResponse(200, "Message updated", null), 200);
      } catch (error) {
        return c.json(new APIResponse(500, "Internal server error", null), 500);
      }
    }
  );

export default app;
