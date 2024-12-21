import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<(typeof client.api.messages)['update-message']['$post']>;
type RequestType = InferRequestType<(typeof client.api.messages)['update-message']['$post']>;

export const useUpdateMessage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.messages['update-message']['$post']({ json });
      return await response.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success(response.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Something went wrong while updating message');
    },
  });

  return mutation;
};
