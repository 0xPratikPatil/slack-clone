"use client";

import { Loader } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import { useEffect } from "react";

import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-create-workspace-modal";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";

const HomePage = () => {
  const [open, setOpen] = useCreateWorkspaceModal();
  const { data: workspaces, isLoading: workspacesLoading } = useGetWorkspaces();

  useEffect(() => {
    if (workspacesLoading) return;
    console.log("Fetched workspaces response:", workspaces?.data);

    const workspaceId = workspaces?.data?.[0]?.id || null;

    if (workspaceId && !open) {
      redirect(`/workspace/${workspaceId}`);
    } else if (!workspaceId && !open) {
      setOpen(true);
    }
  }, [workspacesLoading, open, setOpen, workspaces]);

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 bg-[#5E2C5F]/95 text-white">
      {workspacesLoading ? <Loader className="size-5 animate-spin" /> : null}
    </div>
  );
};

export default HomePage;
