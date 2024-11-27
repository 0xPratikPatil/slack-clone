"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { ShadcnThemes } from "@prisma/client";
import { useThemeApplier } from "@/hooks/use-theme-applier";
import { ThemeGenerator } from "@/components/ui/theme-generator";
import { generateCSSCode } from "@/lib/copy-code/generators";
import { ThemeGeneratorProperties } from "@/components/ui/theme-generator-properties";

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark"], {
    required_error: "Please select a theme.",
  }),
  font: z.enum(["inter", "manrope", "system"], {
    invalid_type_error: "Select a font",
    required_error: "Please select a font.",
  }),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

const defaultValues: Partial<AppearanceFormValues> = { theme: "light" };

interface ThemeGeneratorProps {
  allThemes: ShadcnThemes[];
  initialPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

const SettingsAppearancePage = ({
  allThemes,
  initialPagination,
}: ThemeGeneratorProps) => {
  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues,
  });
  const { currentTheme, setCurrentTheme } = useThemeApplier();

  const onSubmit = (data: AppearanceFormValues) => {
    // Handle form submission
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of the app. Automatically switch between day
          and night themes.
        </p>
      </div>
      <Separator />
      <ThemeGenerator
        allThemes={allThemes}
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
        initialPagination={initialPagination}
      />
      <Separator />
      <ThemeGeneratorProperties
        shadcnTheme={currentTheme}
        setShadcnTheme={setCurrentTheme}
        copyCode={() => generateCSSCode(currentTheme)}
      />
    </div>
  );
};

export default SettingsAppearancePage;
