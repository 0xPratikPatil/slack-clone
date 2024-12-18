import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType } from 'hono';
import { InferRequestType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<(typeof client.api.conversations)['create-or-get-conversation']['$post']>;
type RequestType = InferRequestType<(typeof client.api.conversations)['create-or-get-conversation']['$post']>;

export const useCreateOrGetConversation = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.conversations['create-or-get-conversation']['$post']({ json });
      return await response.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success(response.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Something went wrong while creating or getting conversation');
    },
  });

  return mutation;
};
