'use client';

import { AlertTriangle, HashIcon, Loader, MessageSquareText, SendHorizonal } from 'lucide-react';

import { useGetChannels } from '@/features/channels/api/use-get-channels';
import { useCreateChannelModal } from '@/features/channels/store/use-create-channel-modal';
import { useGetCurrentMember } from '@/features/members/api/use-current-member';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetWorkspaceById } from '@/features/workspaces/api/use-get-workspace';
import { useChannelId } from '@/hooks/use-channel-id';
import { useMemberId } from '@/hooks/use-member-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

import { SidebarItem } from './sidebar-item';
import { UserItem } from './user-item';
import { WorkspaceHeader } from './workspace-header';
import { WorkspaceSection } from './workspace-section';

export const WorkspaceSidebar = () => {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const memberId = useMemberId();

  const [_open, setOpen] = useCreateChannelModal();

  const { data: member, isLoading: memberLoading } = useGetCurrentMember({ workspaceId });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspaceById({ workspaceId });
  const { data: channels, isLoading: channelsLoading } = useGetChannels({ workspaceId });
  const { data: members, isLoading: membersLoading } = useGetMembers({ workspaceId });

  if (memberLoading || workspaceLoading || channelsLoading || membersLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#5E2C5F]">
        <Loader className="size-5 animate-spin text-white" />
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-y-2 bg-[#5E2C5F]">
        <AlertTriangle className="size-5 text-white" />
        <p className="text-sm text-white">Workspace not found.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-y-2 bg-[#5E2C5F]">
      <WorkspaceHeader workspace={workspace.data} isAdmin={member.data?.role === 'admin'} />

      <div className="mt-3 flex flex-col px-2">
        <SidebarItem label="Threads" icon={MessageSquareText} id="threads" />

        <SidebarItem label="Drafts & Sent" icon={SendHorizonal} id="draft" />
      </div>

      {channels && channels.data?.length !== 0 && (
        <WorkspaceSection
          label="Channels"
          hint="New Channel"
          onNew={member.data?.role === "admin" ? () => setOpen(true) : undefined}
        >
          {channels?.data?.map((item) => (
            <SidebarItem
              variant={channelId === item.id ? 'active' : 'default'}
              key={item.id}
              id={item.id}
              icon={HashIcon}
              label={item.name}
            />
          ))}
        </WorkspaceSection>
      )}

      {members && members.data?.length !== 0 && (
        <WorkspaceSection
          label="Direct Messages"
          hint="New Direct Message"
          onNew={member.data?.role === "admin" ? () => {} : undefined}
        >
          {members?.data?.map((item) => (
            <UserItem
              key={item.id}
              id={item.id}
              label={item.name}
              image={item.image}
              variant={item.id === memberId ? "active" : "default"}
            />
          ))}
        </WorkspaceSection>
      )}
    </div>
  );
};
