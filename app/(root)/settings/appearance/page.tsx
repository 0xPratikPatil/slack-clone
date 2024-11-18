import React from "react";
import SettingsAppearancePage from "@/components/settings/appearance-page";
import { getThemes } from "@/lib/actions/shadcn-theme-actions";

const AppearancePage = async () => {
  const { themes, pagination } = await getThemes(1, 5);

  return (
    <SettingsAppearancePage allThemes={themes} initialPagination={pagination} />
  );
};

export default AppearancePage;
