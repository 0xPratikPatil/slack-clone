import { Hono } from "hono"
import { handle } from "hono/vercel"
import { auth } from "@/lib/auth";

const app = new Hono().basePath("/api")

app.on(["POST", "GET"], "/auth/**", (c) => {
    return auth.handler(c.req.raw);
});

const routes = app


export const GET = handle(app)
export const POST = handle(app)

// //eslint-disable-next-line @typescript-eslint/no-unused-vars
export type AppType = typeof routes

