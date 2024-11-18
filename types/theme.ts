import { User } from "@prisma/client";

export type Palette = {
  id: string;
  text: string;
  "text-2": string;
  "text-3": string;
  interface: string;
  "interface-2": string;
  "interface-3": string;
  background: string;
  "background-2": string;
  primary: string;
  secondary: string;
  accent: string;
  "accent-2": string;
  "accent-3": string;
};

export type ThemeType = "light" | "dark";

export type DarkLightPalette = {
  dark: Palette;
  light: Palette;
};

export type ThemeConfig = {
  id: string;
  name: string;
  displayName: string;
  isPublic: boolean;
  category: "featured" | "rayso" | "community" | "user";
  createdAt: Date;
  user: User | null;
  palette: DarkLightPalette;
};
