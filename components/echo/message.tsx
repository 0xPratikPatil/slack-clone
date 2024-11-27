import { format, isToday, isYesterday } from 'date-fns';
import { Loader } from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRemoveMessage } from '@/features/messages/api/use-remove-message';
import { useUpdateMessage } from '@/features/messages/api/use-update-message';
import { useToggleReaction } from '@/features/reactions/api/use-toggle-reaction';
import { useConfirm } from '@/hooks/use-confirm';
import { usePanel } from '@/hooks/use-panel';
import { cn } from '@/lib/utils';

import { Hint } from '@/components/echo/hint';
import { Reactions } from '@/components/echo/reactions';
import { ThreadBar } from '@/components/echo/thread-bar';
import { Thumbnail } from '@/components/echo/thumbnail';
import { Toolbar } from '@/components/echo/toolbar';
import { EchoMember, EchoReaction, EchoMessage } from '@prisma/client';

const Renderer = dynamic(() => import('@/components/echo/renderer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  ),
});
const Editor = dynamic(() => import('./editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface MessageProps {
  id: EchoMessage["id"];
  memberId: EchoMember["id"];
  authorName?: string;
  authorImage?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<EchoReaction, 'memberId'> & {
      count: number;
      memberIds: EchoMember["id"][];
    }
  >;
  body: EchoMessage["body"];
  image: string | null | undefined;
  createdAt: EchoMessage["createdAt"];
  updatedAt: EchoMessage["updatedAt"];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: EchoMessage["id"] | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadName?: string;
  threadTimestamp?: number;
}

const formatFullTime = (date: Date) => {
  return `${isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'MMM d, yyyy')} at ${format(date, 'h:mm:ss a')}`;
};

export const Message = ({
  id,
  isAuthor,
  body,
  createdAt,
  image,
  isEditing,
  authorName = 'Member',
  authorImage,
  memberId,
  reactions,
  setEditingId,
  updatedAt,
  hideThreadButton,
  isCompact,
  threadCount,
  threadImage,
  threadName,
  threadTimestamp,
}: MessageProps) => {
  const [ConfirmDialog, confirm] = useConfirm('Delete message', 'Are you sure you want to delete this message? This cannot be undone.');
  const { parentMessageId, onOpenMessage, onOpenProfile, onClose } = usePanel();

  const { mutate: updateMessage, isPending: isUpdatingMessage } = useUpdateMessage();
  const { mutate: removeMessage, isPending: isRemovingMessage } = useRemoveMessage();
  const { mutate: toggleReaction, isPending: isTogglingReaction } = useToggleReaction();

  const avatarFallback = authorName.charAt(0).toUpperCase();
  const isPending = isUpdatingMessage || isRemovingMessage || isTogglingReaction;

  const handleUpdate = ({ body }: { body: string }) => {
    updateMessage(
      { json: { id, body } },
      {
        onSuccess: () => {
          toast.success('Message updated.');
          setEditingId(null);
        },
        onError: () => {
          toast.error('Failed to update message.');
        },
      },
    );
  };

  const handleDelete = async () => {
    const ok = await confirm();

    if (!ok) return;

    removeMessage(
      { json: { id } },
      {
        onSuccess: () => {
          toast.success('Message deleted.');

          if (parentMessageId === id) onClose();
        },
        onError: () => {
          toast.error('Failed to delete message.');
        },
      },
    );
  };

  const handleReaction = async (value: string) => {
    toggleReaction(
      { json: { messageId: id, value } },
      {
        onError: () => {
          toast.error('Failed to toggle reaction.');
        },
      },
    );
  };

  if (isCompact) {
    return (
      <>
        <ConfirmDialog />

        <div
          className={cn(
            'group relative flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60',
            isEditing && 'bg-[#f2c74433] hover:bg-[#f2c74433]',
            isRemovingMessage && 'origin-bottom scale-y-0 transform bg-rose-500/50 transition-all duration-200',
          )}
        >
          <div className="flex items-start gap-2">
            <Hint label={formatFullTime(new Date(createdAt))}>
              <button className="w-[40px] text-center text-sm leading-[22px] text-muted-foreground opacity-0 hover:underline group-hover:opacity-100">
                {format(new Date(createdAt), 'hh:mm')}
              </button>
            </Hint>

            {isEditing ? (
              <div className="size-full">
                <Editor
                  onSubmit={handleUpdate}
                  disabled={isPending}
                  defaultValue={JSON.parse(body)}
                  onCancel={() => setEditingId(null)}
                  variant="update"
                />
              </div>
            ) : (
              <div className="flex w-full flex-col">
                <Renderer value={body} />
                <Thumbnail url={image} />

                {updatedAt ? <span className="text-xs text-muted-foreground">(edited)</span> : null}

                <Reactions data={reactions} onChange={handleReaction} />
                <ThreadBar
                  count={threadCount}
                  image={threadImage}
                  name={threadName}
                  timestamp={threadTimestamp}
                  onClick={() => onOpenMessage(id)}
                />
              </div>
            )}
          </div>

          {!isEditing && (
            <Toolbar
              isAuthor={isAuthor}
              isPending={isPending}
              handleEdit={() => setEditingId(id)}
              handleThread={() => onOpenMessage(id)}
              handleDelete={handleDelete}
              handleReaction={handleReaction}
              hideThreadButton={hideThreadButton}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <ConfirmDialog />

      <div
        className={cn(
          'group relative flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60',
          isEditing && 'bg-[#f2c74433] hover:bg-[#f2c74433]',
          isRemovingMessage && 'origin-bottom scale-y-0 transform bg-rose-500/50 transition-all duration-200',
        )}
      >
        <div className="flex items-start gap-2">
          <button onClick={() => onOpenProfile(memberId)}>
            <Avatar>
              <AvatarImage alt={authorName} src={authorImage} />

              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </button>

          {isEditing ? (
            <div className="size-full">
              <Editor
                onSubmit={handleUpdate}
                disabled={isPending}
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex w-full flex-col overflow-hidden">
              <div className="text-sm">
                <button onClick={() => onOpenProfile(memberId)} className="font-bold text-primary hover:underline">
                  {authorName}
                </button>

                <span>&nbsp;&nbsp;</span>

                <Hint label={formatFullTime(new Date(createdAt))}>
                  <button className="text-xs text-muted-foreground hover:underline">{format(new Date(createdAt), 'h:mm a')}</button>
                </Hint>
              </div>

              <Renderer value={body} />
              <Thumbnail url={image} />

              {updatedAt ? <span className="text-xs text-muted-foreground">(edited)</span> : null}

              <Reactions data={reactions} onChange={handleReaction} />
              <ThreadBar
                count={threadCount}
                image={threadImage}
                name={threadName}
                timestamp={threadTimestamp}
                onClick={() => onOpenMessage(id)}
              />
            </div>
          )}
        </div>

        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isPending}
            handleEdit={() => setEditingId(id)}
            handleThread={() => onOpenMessage(id)}
            handleDelete={handleDelete}
            handleReaction={handleReaction}
            hideThreadButton={hideThreadButton}
          />
        )}
      </div>
    </>
  );
};
