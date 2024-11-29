"use client";

import { EchoChannel, EchoMember } from "@prisma/client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetWorkspaceById } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

export const Toolbar = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const workspace = useGetWorkspaceById({ workspaceId });
  const { data: channels } = useGetChannels({ workspaceId });
  const { data: members } = useGetMembers({ workspaceId });

  const [open, setOpen] = useState(false);

  const onChannelClick = (channelId: EchoChannel["id"]) => {
    setOpen(false);

    router.push(`/workspace/${workspaceId}/channel/${channelId}`);
  };

  const onMemberClick = (memberId: EchoMember["id"]) => {
    setOpen(false);

    router.push(`/workspace/${workspaceId}/member/${memberId}`);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <nav className="flex h-10 items-center justify-between bg-[#481349] p-1.5">
      <div className="flex-1" aria-hidden />

      <div className="min-w-[280px] max-w-[642px] shrink grow-[2]">
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          className="h-7 w-full justify-start bg-accent/25 px-2 hover:bg-accent/25"
        >
          <Search className="mr-2 size-4 text-white" />
          <span className="text-xs text-white">
            Search {workspace?.data?.name ?? "workspace"}...
          </span>

          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-90">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput
            placeholder={`Search ${workspace?.data?.name ?? "workspace"}...`}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Channels">
              {channels?.data?.map((channel) => (
                <CommandItem
                  onSelect={() => onChannelClick(channel.id)}
                  key={channel.id}
                >
                  {channel.name}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Members">
              {members?.data?.map((member) => (
                <CommandItem
                  onSelect={() => onMemberClick(member.id)}
                  key={member.id}
                >
                  {member.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </nav>
  );
};
