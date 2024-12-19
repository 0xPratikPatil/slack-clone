import {
  AlertTriangle,
  ChevronDown,
  Loader,
  MailIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { useGetCurrentMember } from "../api/use-current-member";
import { useGetMemberById } from "../api/use-get-member";
import { useRemoveMember } from "../api/use-remove-member";
import { useUpdateMember } from "../api/use-update-member";
import { EchoMember } from "@prisma/client";

interface ProfileProps {
  memberId: EchoMember["id"];
  onClose: () => void;
}

export const Profile = ({ memberId, onClose }: ProfileProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const [LeaveDialog, confirmLeave] = useConfirm(
    "Leave workspace",
    "Are you sure you want to leave this workspace?"
  );
  const [UpdateDialog, confirmUpdate] = useConfirm(
    "Change role",
    "Are you sure you want to change this member's role?"
  );
  const [RemoveDialog, confirmRemove] = useConfirm(
    "Remove member",
    "Are you sure you want to remove this member?"
  );

  const { data: currentMember, isLoading: isCurrentMemberLoading } =
    useGetCurrentMember({
      workspaceId,
    });
  const { data: member, isLoading: isMemberLoading } = useGetMemberById({
    id: memberId,
  });

  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();
  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveMember();

  const onRemove = async () => {
    const ok = await confirmRemove();

    if (!ok) return;

    removeMember(
      { json: { id: memberId } },
      {
        onSuccess: () => {
          toast.success("Member removed.");
          onClose();
        },
        onError: () => toast.error("Failed to remove member."),
      }
    );
  };

  const onLeave = async () => {
    const ok = await confirmLeave();

    if (!ok) return;

    removeMember(
      { json: { id: memberId } },
      {
        onSuccess: () => {
          toast.success("You left the workspace.");
          router.replace("/");
          onClose();
        },
        onError: () => toast.error("Failed to leave the workspace."),
      }
    );
  };

  const onUpdate = async (role: "admin" | "member") => {
    if (member?.data?.role === role) return;

    const ok = await confirmUpdate();

    if (!ok) return;

    updateMember(
      { json: { id: memberId, role } },
      {
        onSuccess: () => {
          toast.success("Role changed.");
        },
        onError: () => toast.error("Failed to change role."),
      }
    );
  };

  if (isMemberLoading || isCurrentMemberLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-[49px] items-center justify-between border-b px-4">
          <p className="text-lg font-bold">Profile</p>

          <Button onClick={onClose} size="icon" variant="ghost">
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>

        <div className="flex h-full items-center justify-center">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!member || !currentMember) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-[49px] items-center justify-between border-b px-4">
          <p className="text-lg font-bold">Profile</p>

          <Button onClick={onClose} size="icon" variant="ghost">
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>

        <div className="flex h-full flex-col items-center justify-center gap-y-2">
          <AlertTriangle className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Profile not found.</p>
        </div>
      </div>
    );
  }

  const avatarFallback = member.data?.user.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      <LeaveDialog />
      <UpdateDialog />
      <RemoveDialog />

      <div className="flex h-full flex-col">
        <div className="flex h-[49px] items-center justify-between border-b px-4">
          <p className="text-lg font-bold">Profile</p>

          <Button onClick={onClose} size="icon" variant="ghost">
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center p-4">
          <Avatar className="size-full max-h-[256px] max-w-[256px]">
            <AvatarImage src={member.data?.user.image} />

            <AvatarFallback className="aspect-square text-6xl">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col p-4">
          <p className="text-xl font-bold">{member.data?.user.name}</p>

          {currentMember.data?.role === "admin" &&
          currentMember.data?._id !== memberId ? (
            <div className="mt-4 flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full capitalize">
                    {member.data?.role} <ChevronDown className="ml-2 size-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-full">
                  <DropdownMenuRadioGroup
                    value={member.data?.role}
                    onValueChange={(role) =>
                      onUpdate(role as "admin" | "member")
                    }
                  >
                    <DropdownMenuRadioItem value="admin">
                      Admin
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="member">
                      Member
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={onRemove} variant="outline" className="w-full">
                Remove
              </Button>
            </div>
          ) : currentMember.data?._id === memberId &&
            currentMember.data?.role !== "admin" ? (
            <div className="mt-4">
              <Button onClick={onLeave} variant="outline" className="w-full">
                Leave
              </Button>
            </div>
          ) : null}
        </div>

        <Separator />

        <div className="flex flex-col p-4">
          <p className="mb-4 text-sm font-bold">Contact information</p>

          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <MailIcon className="size-4" />
            </div>

            <div className="flex flex-col">
              <p className="text-[13px] font-semibold text-muted-foreground">
                Email Address
              </p>

              <Link
                href={`mailto:${member.data?.user.email}`}
                className="text-sm text-[#1264a3] hover:underline"
              >
                {member.data?.user.email}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
