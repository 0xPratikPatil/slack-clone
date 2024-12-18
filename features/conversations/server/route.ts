import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { APIResponse } from '@/helper/apiResponse';
import db from '@/lib/db';
import { Session } from '@/types/auth';

const createOrGetConversationSchema = z.object({
  memberId: z.string(),
  workspaceId: z.string(),
});

const app = new Hono<{
  Variables: {
    user: Session['user'] | null;
    session: Session['session'] | null;
  };
}>().post('/create-or-get-conversation', zValidator('json', createOrGetConversationSchema), async (c) => {
  try {
    const { memberId, workspaceId } = c.req.valid('json');
    const userId = await c.get('user')?.id;

    if (!userId) {
      return c.json(new APIResponse(401, 'Unauthorized access', null), 401);
    }

    const currentMember = await db.echoMember.findFirst({
      where: {
        id: userId,
        workspaceId,
      },
    });

    const otherMember = await db.echoMember.findFirst({
      where: {
        id: memberId,
      },
    });
    if (!currentMember || !otherMember) {
      return c.json(new APIResponse(404, 'Member not found', null), 404);
    }

    const existingConversation = await db.echoConversation.findFirst({
      where: {
        workspaceId,
        OR: [
          { memberOneId: currentMember.id, memberTwoId: otherMember.id },
          { memberOneId: otherMember.id, memberTwoId: currentMember.id },
        ],
      },
    });

    if (existingConversation) {
      return c.json(new APIResponse(200, 'Conversation found', existingConversation.id), 200);
    }

    const newConversation = await db.echoConversation.create({
      data: {
        workspaceId,
        memberOneId: currentMember.id,
        memberTwoId: otherMember.id,
      },
    });

    return c.json(new APIResponse(200, 'Conversation created', newConversation.id), 200);
  } catch (error) {
    return c.json(new APIResponse(500, 'Internal server error', null), 500);
  }
});

export default app;
