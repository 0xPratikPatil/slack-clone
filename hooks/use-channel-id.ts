"use client";

import { EchoChannel } from "@prisma/client";
import { useParams } from "next/navigation";

type ChannelIdParams = {
  channelId: EchoChannel["id"];
};

export const useChannelId = () => {
  const params = useParams<ChannelIdParams>();

  return params.channelId;
};
