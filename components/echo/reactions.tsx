import { MdOutlineAddReaction } from 'react-icons/md';

import { useGetCurrentMember } from '@/features/members/api/use-current-member';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

import { EmojiPopover } from '@/components/echo/emoji-popover';
import { Hint } from '@/components/echo/hint';
import { EchoMember, EchoReaction } from '@prisma/client';

interface ReactionsProps {
  data: Array<
    Omit<EchoReaction, 'memberId'> & {
      count: number;
      memberIds: EchoMember['id'][];
    }
  >;
  onChange: (value: string) => void;
}

export const Reactions = ({ data, onChange }: ReactionsProps) => {
  const workspaceId = useWorkspaceId();
  const { data: currentMember } = useGetCurrentMember({ workspaceId });

  const currentMemberId = currentMember?.data?.id;

  if (data.length === 0 || !currentMemberId) return null;

  return (
    <div className="my-1 flex items-center gap-1">
      {data.map((reaction) => (
        <Hint key={reaction.id} label={`${reaction.count} ${reaction.count === 1 ? 'person' : 'people'} reacted with ${reaction.value}`}>
          <button
            onClick={() => onChange(reaction.value)}
            className={cn(
              'flex h-6 items-center gap-x-1 rounded-full border border-transparent bg-slate-200/70 px-2 text-slate-800',
              reaction.memberIds.includes(currentMemberId) && 'border-blue-500 bg-blue-100/70 text-white',
            )}
          >
            {reaction.value}{' '}
            <span
              className={cn('text-xs font-semibold text-muted-foreground', reaction.memberIds.includes(currentMemberId) && 'text-blue-500')}
            >
              {reaction.count}
            </span>
          </button>
        </Hint>
      ))}

      <EmojiPopover hint="Add a reaction" onEmojiSelect={onChange}>
        <button className="flex h-7 items-center gap-x-1 rounded-full border border-transparent bg-slate-200/70 px-3 text-slate-800 hover:border-slate-500">
          <MdOutlineAddReaction className="size-4" />
        </button>
      </EmojiPopover>
    </div>
  );
};
