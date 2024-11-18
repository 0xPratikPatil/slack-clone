import APIResponse from "@/helper/apiResponse";
import { Session } from "@/types/auth";
import { Hono } from "hono";
import { z } from "zod";
import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { zValidator } from "@hono/zod-validator";
import { sanitizeJsonInput } from "@/lib/utils";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

const HSLAColorString = z
  .string()
  .regex(
    /^hsla\(\d{1,3},\s*\d{1,3}%,\s*\d{1,3}%,\s*(?:0(?:\.\d+)?|1(?:\.0+)?)\)$/
  );

const ThemeSchema = z.object({
  background: HSLAColorString,
  foreground: HSLAColorString,
  card: HSLAColorString,
  "card-foreground": HSLAColorString,
  popover: HSLAColorString,
  "popover-foreground": HSLAColorString,
  primary: HSLAColorString,
  "primary-foreground": HSLAColorString,
  secondary: HSLAColorString,
  "secondary-foreground": HSLAColorString,
  muted: HSLAColorString,
  "muted-foreground": HSLAColorString,
  accent: HSLAColorString,
  "accent-foreground": HSLAColorString,
  destructive: HSLAColorString,
  "destructive-foreground": HSLAColorString,
  border: HSLAColorString,
  input: HSLAColorString,
  ring: HSLAColorString,
});

const ChartColorSchema = z.object({
  "chart-1": HSLAColorString,
  "chart-2": HSLAColorString,
  "chart-3": HSLAColorString,
  "chart-4": HSLAColorString,
  "chart-5": HSLAColorString,
});

const outputSchema = z.object({
  displayName: z.string().min(3).describe("Short theme name"),
  light: ThemeSchema,
  dark: ThemeSchema,
  radius: z.number().describe("in rem units"),
  charts: z.object({
    light: ChartColorSchema,
    dark: ChartColorSchema,
  }),
});

function parseHSLA(hsla: string): {
  h: number;
  s: number;
  l: number;
  a: number;
} {
  const match = hsla.match(/hsla\((\d+),\s*(\d+)%,\s*(\d+)%,\s*([\d.]+)\)/);
  if (!match || match.length !== 5) {
    throw new Error(`Invalid HSLA string: ${hsla}`);
  }

  const [, h, s, l, a] = match;

  if (
    h === undefined ||
    s === undefined ||
    l === undefined ||
    a === undefined
  ) {
    throw new Error(`Invalid HSLA string: ${hsla}`);
  }

  return {
    h: parseInt(h, 10),
    s: parseInt(s, 10),
    l: parseInt(l, 10),
    a: parseFloat(a),
  };
}

const outputSchema2 = z.object({
  enhancedPrompt: z
    .string()
    .describe(
      "Enhanced theme description prompt for shadcn/ui (ideally 10-200 characters)"
    ),
});

const promptSchema = z.object({
  prompt: z.string().min(3).describe("Theme description"),
});

const app = new Hono<{
  Variables: {
    user: Session["user"] | null;
    session: Session["session"] | null;
  };
}>()
  .post("/generate", zValidator("json", promptSchema), async (c) => {
    const { prompt } = c.req.valid("json");

    try {
      const result = await generateObject({
        model: groq("llama3-70b-8192"),
        system: `You are an expert at generating shadcn themes. Create a visually appealing and cohesive theme based on the user's prompt. Follow these guidelines:
        - Create both light and dark mode color schemes.
        - Ensure high contrast between background and foreground for readability in both modes.
        - Use appropriate colors for primary, secondary, accent, and destructive elements in both modes.
        - All color values should be in HSLA format as strings (e.g., "hsla(360, 100%, 50%, 1)").
        - Radius should be in rem units.
        - Create sets of chart colors that work well together and with the main theme for both light and dark modes.`,
        schema: outputSchema,
        prompt: `Generate a shadcn theme with light and dark modes based on this description: "${prompt}"`,
      });

      const parsedTheme = {
        ...result.object,
        light: Object.fromEntries(
          Object.entries(result.object.light).map(([key, value]) => [
            key,
            parseHSLA(value as string),
          ])
        ),
        dark: Object.fromEntries(
          Object.entries(result.object.dark).map(([key, value]) => [
            key,
            parseHSLA(value as string),
          ])
        ),
        charts: {
          light: Object.fromEntries(
            Object.entries(result.object.charts.light).map(([key, value]) => [
              key,
              parseHSLA(value as string),
            ])
          ),
          dark: Object.fromEntries(
            Object.entries(result.object.charts.dark).map(([key, value]) => [
              key,
              parseHSLA(value as string),
            ])
          ),
        },
      };

      const newTheme = await db.shadcnThemes.create({
        data: {
          id: uuidv4(),
          name: result.object.displayName,
          display_name: result.object.displayName,
          light_scheme: sanitizeJsonInput(result.object.light),
          dark_scheme: sanitizeJsonInput(result.object.dark),
          radius: String(result.object.radius),
          charts: sanitizeJsonInput(result.object.charts),
        },
      });
      return c.json(
        new APIResponse(200, "Theme generated successfully.", parsedTheme),
        200
      );
    } catch (error) {
      return c.json(
        new APIResponse(500, "Failed to generate theme.", null),
        500
      );
    }
  })
  .post("/enhance", zValidator("json", promptSchema), async (c) => {
    const { prompt } = c.req.valid("json");
    try {
      const result = await generateObject({
        model: groq("llama3-70b-8192"),
        system: `You are an expert at enhancing theme descriptions for shadcn/ui, a React component library. Your task is to take a user's initial theme idea and expand it into a more evocative and atmospheric description. Follow these guidelines:
          - Maintain the core concept and mood of the original prompt
          - Use rich, descriptive language to evoke a specific atmosphere or feeling
          - Suggest a cohesive color palette that fits the theme's mood (e.g., "deep grays, silvers, and muted blues")
          - Incorporate thematic elements that could influence UI design (e.g., "gothic and fantasy elements")
          - Keep the enhanced prompt concise (max 150 characters)
          - Aim for a tone similar to this example: "A theme inspired by Mistborn, evoking a dark, mysterious, and magical atmosphere. Expect deep grays, silvers, and muted blues with gothic and fantasy elements."`,
        schema: outputSchema2,
        prompt: `Enhance this shadcn/ui theme description, maintaining its mood and adding atmospheric details: "${prompt}"`,
      });

      return c.json(
        new APIResponse(
          200,
          "Appearance updated successfully.",
          result.object.enhancedPrompt
        ),
        200
      );
    } catch (error) {
      return c.json(
        new APIResponse(500, "Failed to enhance theme.", null),
        500
      );
    }
  });

export default app;
