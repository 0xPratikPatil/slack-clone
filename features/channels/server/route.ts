import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { APIResponse } from '@/helper/apiResponse';
import db from '@/lib/db';
import { Session } from '@/types/auth';

const createEchoChannelSchema = z.object({
  name: z.string(),
  workspaceId: z.string(),
});

const app = new Hono<{
  Variables: {
    user: Session['user'] | null;
    session: Session['session'] | null;
  };
}>()
  .post('/create-channel', zValidator('json', createEchoChannelSchema), async (c) => {
    try {
      const { name, workspaceId } = c.req.valid('json');
      const userId = await c.get('user')?.id;

      if (!userId) {
        return c.json(new APIResponse(401, 'Unauthorized access', null), 401);
      }
      const member = await db.echoMember.findFirst({
        where: {
          userId,
          workspaceId,
        },
      });

      if (!member || member.role !== 'admin') {
        return c.json(new APIResponse(401, 'Unauthorized access', null), 401);
      }
      const parsedName = name.replace(/\s+/g, '-').toLowerCase();

      await db.echoChannel.create({
        data: {
          name: parsedName,
          workspaceId,
        },
      });

      return c.json(new APIResponse(200, 'Created channel', null), 200);
    } catch (error) {
      return c.json(new APIResponse(500, 'Internal server error', null), 500);
    }
  })
  .post('/get-all', zValidator('json', z.object({ workspaceId: z.string() })), async (c) => {
    try {
      const { workspaceId } = c.req.valid('json');
      const userId = await c.get('user')?.id;

      if (!userId) {
        return c.json(new APIResponse(401, 'Unauthorized access', null), 401);
      }

      const member = await db.echoMember.findFirst({
        where: {
          userId,
          workspaceId,
        },
      });
      if (!member) {
        return c.json(new APIResponse(401, 'Unauthorized access', null), 401);
      }

      const channels = await db.echoChannel.findMany({
        where: {
          workspaceId,
        },
      });

      return c.json(new APIResponse(200, 'Channels fetched', channels), 200);
    } catch (error) {
      return c.json(new APIResponse(500, 'Internal server error', null), 500);
    }
  })
  .post('/get-by-id', zValidator('json', z.object({ channelId: z.string() })), async (c) => {
    try {
      const { channelId } = c.req.valid('json');
      const userId = await c.get('user')?.id;

      if (!userId) {
        return c.json(new APIResponse(401, 'Unauthorized access', null), 401);
      }
      const channel = await db.echoChannel.findUnique({
        where: {
          id: channelId,
        },
      });

      if (!channel) {
        return c.json(new APIResponse(404, 'Channel not found', null), 404);
      }

      const member = await db.echoMember.findFirst({
        where: {
          userId,
          workspaceId: channel?.workspaceId,
        },
      });
      if (!member) {
        return c.json(new APIResponse(401, 'Unauthorized access', null), 401);
      }

      return c.json(new APIResponse(200, 'Channel fetched', channel), 200);
    } catch (error) {
      return c.json(new APIResponse(500, 'Internal server error', null), 500);
    }
  })
  .post('/remove-channel', zValidator('json', z.object({ channelId: z.string() })), async (c) => {
    try {
      const { channelId } = c.req.valid('json');
      const userId = await c.get('user')?.id;

      if (!userId) {
        return c.json(new APIResponse(401, 'Unauthorized access', null), 401);
      }
      const channel = await db.echoChannel.findUnique({
        where: {
          id: channelId,
        },
      });
      if (!channel) {
        return c.json(new APIResponse(404, 'Channel not found', null), 404);
      }

      const member = await db.echoMember.findFirst({
        where: {
          userId,
          workspaceId: channel?.workspaceId,
        },
      });

      if (!member || member.role !== 'admin') {
        return c.json(new APIResponse(401, 'Unauthorized access', null), 401);
      }

      await db.echoChannel.delete({
        where: {
          id: channelId,
        },
      });

      return c.json(new APIResponse(200, 'Channel removed', null), 200);
    } catch (error) {
      return c.json(new APIResponse(500, 'Internal server error', null), 500);
    }
  })
  .post('/update-channel', zValidator('json', z.object({ channelId: z.string(), name: z.string() })), async (c) => {
    try {
      const { channelId, name } = c.req.valid('json');
      const userId = await c.get('user')?.id;

      if (!userId) {
        return c.json(new APIResponse(401, 'Unauthorized access', null), 401);
      }
      const channel = await db.echoChannel.findUnique({
        where: {
          id: channelId,
        },
      });
      if (!channel) {
        return c.json(new APIResponse(404, 'Channel not found', null), 404);
      }

      const member = await db.echoMember.findFirst({
        where: {
          userId,
          workspaceId: channel?.workspaceId,
        },
      });

      if (!member || member.role !== 'admin') {
        return c.json(new APIResponse(401, 'Unauthorized access', null), 401);
      }
      const parsedName = name.replace(/\s+/g, '-').toLowerCase();

      await db.echoChannel.update({
        where: {
          id: channelId,
        },
        data: {
          name: parsedName,
        },
      });

      return c.json(new APIResponse(200, 'Channel updated', null), 200);
    } catch (error) {
      return c.json(new APIResponse(500, 'Internal server error', null), 500);
    }
  });

export default app;
