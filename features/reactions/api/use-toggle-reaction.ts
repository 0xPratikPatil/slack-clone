import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<(typeof client.api.reactions)['toggle']['$post']>;
type RequestType = InferRequestType<(typeof client.api.reactions)['toggle']['$post']>;

export const useToggleReaction = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.reactions['toggle']['$post']({ json });
      return await response.json();
    },
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Something went wrong while toggling reaction');
    },
  });

  return mutation;
};
