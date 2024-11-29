"use client";

import { Loader, TriangleAlert } from "lucide-react";

import { MessageList } from "@/components/echo/message-list";
import { useGetChannelById } from "@/features/channels/api/use-get-channel";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { useChannelId } from "@/hooks/use-channel-id";

import { ChatInput } from "./chat-input";
import { Header } from "./header";

const ChannelIdPage = () => {
  const channelId = useChannelId();

  const { results, status, loadMore, isLoadingMore, canLoadMore } =
    useGetMessages({ channelId });
  const { data: channel, isLoading: channelLoading } = useGetChannelById({
    channelId,
  });

  if (channelLoading || status === "pending") {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-2">
        <TriangleAlert className="size-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Channel not found.
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header channelName={channel.data?.name} />

      <MessageList
        channelName={channel.data?.name}
        channelCreationTime={channel.data?.createdAt}
        data={results?.data}
        loadMore={loadMore}
        isLoadingMore={isLoadingMore}
        canLoadMore={canLoadMore}
      />

      <ChatInput placeholder={`Message # ${channel.data?.name}`} />
    </div>
  );
};

export default ChannelIdPage;
