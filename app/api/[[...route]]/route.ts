import { Hono } from "hono";
import { handle } from "hono/vercel";
import { auth } from "@/lib/auth/auth";
import { Session } from "@/types/auth";
import settingsRoute from "@/features/settings/server/route";
import supportRoute from "@/features/support/server/route";
import { cors } from "hono/cors";
import { trustedOrigins } from "@/constants/trustedOrigins";

const app = new Hono<{
  Variables: {
    user: Session["user"] | null;
    session: Session["session"] | null;
  };
}>().basePath("/api");

app.use(
  cors({
    origin: trustedOrigins,
    credentials: true,
  })
);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.on(["POST", "GET"], "/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

const routes = app
  .route("/settings", settingsRoute)
  .route("/support", supportRoute);

export const GET = handle(app);
export const POST = handle(app);

export type AppType = typeof routes;
