import { useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

const BATCH_SIZE = 10;

interface UseGetMessagesProps {
  channelId?: string;
  conversationId?: string;
  parentMessageId?: string;
}

export const useGetMessages = ({
  channelId,
  conversationId,
  parentMessageId,
}: UseGetMessagesProps) => {
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, status } =
    useInfiniteQuery({
      queryKey: ["messages", channelId, conversationId, parentMessageId],
      initialPageParam: 0,
      queryFn: async ({ pageParam = 0 }) => {
        const response = await client.api.messages["get-all"]["$post"]({
          json: {
            channelId: channelId || undefined,
            conversationId: conversationId || undefined,
            parentMessageId: parentMessageId || undefined,
            offset: pageParam,
            limit: BATCH_SIZE,
          },
        });
        return await response.json();
      },
      getNextPageParam: (lastPage, allPages) =>
        lastPage?.data?.length && lastPage.data.length < BATCH_SIZE
          ? undefined
          : allPages.length * BATCH_SIZE,
    });

  const results = data?.data?.pages?.flat() || [];

  return {
    results,
    loadMore: fetchNextPage,
    isLoadingMore: isFetchingNextPage,
    canLoadMore: hasNextPage,
    status,
  };
};
