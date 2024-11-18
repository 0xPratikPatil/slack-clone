import { useState } from "react";
import { Theme } from "@/lib/atoms";

import { useRouter } from "next/navigation";
import { convertShadcnThemeToTheme, getThemeName } from "@/lib/utils";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.settings.appearance.generate)["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.settings.appearance.generate)["$post"]
>;

export const themeGenerator = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.settings.appearance.generate["$post"]({
        json,
      });
      return await response.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success(response.message);
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Something went wrong while generating theme"
      );
    },
  });
  return mutation;
};
