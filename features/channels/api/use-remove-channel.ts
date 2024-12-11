import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<(typeof client.api.channels)['remove-channel']['$post']>;
type RequestType = InferRequestType<(typeof client.api.channels)['remove-channel']['$post']>;

export const useRemoveChannel = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.channels['remove-channel']['$post']({ json });
      return await response.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success(response.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Something went wrong while removing channel');
    },
  });

  return mutation;
};
