import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { APIResponse } from '@/helper/apiResponse';
import db from '@/lib/db';
import { Session } from '@/types/auth';

const toggleSchema = z.object({
  messageId: z.string(),
  value: z.string(),
});

const app = new Hono<{
  Variables: {
    user: Session['user'] | null;
    session: Session['session'] | null;
  };
}>().post('/toggle', zValidator('json', toggleSchema), async (c) => {
  try {
    const { messageId, value } = c.req.valid('json');
    const userId = await c.get('user')?.id;

    if (!userId) {
      return c.json(new APIResponse(401, 'Unauthorized', null), 401);
    }
    const message = await db.echoMessage.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return c.json(new APIResponse(404, 'Message not found', null), 404);
    }

    const member = await db.echoMember.findFirst({
      where: {
        userId,
        workspaceId: message.workspaceId,
      },
    });

    if (!member) {
      return c.json(new APIResponse(401, 'Unauthorized', null), 401);
    }

    const existingReaction = await db.echoReaction.findFirst({
      where: {
        messageId,
        memberId: member.id,
      },
    });

    if (existingReaction) {
      await db.echoReaction.delete({
        where: { id: existingReaction.id },
      });
    } else {
      await db.echoReaction.create({
        data: {
          value,
          memberId: member.id,
          messageId,
          workspaceId: message.workspaceId,
        },
      });
    }

    return c.json(new APIResponse(200, 'Reaction toggled', null), 200);
  } catch (error) {
    return c.json(new APIResponse(500, 'Internal server error', null), 500);
  }
});

export default app;
