"use client";
import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Copy,
  Fingerprint,
  Laptop,
  Loader2,
  Plus,
  QrCode,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { redirect, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Session } from "@/types/auth";
import { UAParser } from "ua-parser-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import QRCode from "react-qr-code";
import CopyButton from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const SettingsSecurityPage = (props: {
  session: Session;
  activeSessions: Session["session"][];
}) => {
  const session = props.session;
  if (!session) return redirect("/login");

  const { data: qr } = useQuery({
    queryKey: ["two-factor-qr"],
    queryFn: async () => {
      const res = await authClient.twoFactor.getTotpUri({
        password: twoFaPassword,
      });
      if (res.error) {
        throw res.error;
      }
      return res.data;
    },
    enabled: !!session?.user.twoFactorEnabled,
  });

  const [isPendingTwoFa, setIsPendingTwoFa] = useState<boolean>(false);
  const [twoFaPassword, setTwoFaPassword] = useState<string>("");
  const [twoFactorDialog, setTwoFactorDialog] = useState<boolean>(false);
  const [twoFactorVerifyURI, setTwoFactorVerifyURI] = useState<string>("");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Security</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <Separator />
      {/* Active Session */}
      <div className="w-full gap-3 flex flex-col">
        <p className="font-medium mb-2">Active Sessions</p>
        {props.activeSessions
          .filter((session) => session.userAgent)
          .map((session) => (
            <ActiveSession
              key={session.id}
              session={session}
              currentSession={props.session}
            />
          ))}
      </div>
      <Separator />

      {/* Manage Passkeys */}
      <div className="w-full gap-3 flex flex-col">
        <p className="font-medium mb-2">Manage Passkeys</p>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap">
            <ListPasskeys />
            <AddPasskey />
          </div>
        </div>
      </div>
      <Separator />

      {/* Manage 2FA */}
      <div className="flex flex-col gap-3 w-full">
        <p className="font-medium mb-2">Manage 2FA</p>
        <div className="flex gap-2">
          {!!session?.user.twoFactorEnabled && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <QrCode size={16} />
                  <span className="md:text-sm text-xs">Scan QR Code</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] w-11/12">
                <DialogHeader>
                  <DialogTitle>Scan QR Code</DialogTitle>
                  <DialogDescription>
                    Scan the QR code with your TOTP app to secure your
                    operations.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center">
                  <QRCode value={qr?.totpURI || ""} />
                </div>
                <div className="flex gap-2 items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Copy URI to clipboard for secure access to your two-factor
                    authentication.
                  </p>
                  <CopyButton textToCopy={qr?.totpURI || ""} />
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={twoFactorDialog} onOpenChange={setTwoFactorDialog}>
            <DialogTrigger asChild>
              <Button
                variant={
                  session?.user.twoFactorEnabled ? "destructive" : "outline"
                }
                className="gap-2"
              >
                {session?.user.twoFactorEnabled ? (
                  <ShieldOff size={16} />
                ) : (
                  <ShieldCheck size={16} />
                )}
                <span className="md:text-sm text-xs">
                  {session?.user.twoFactorEnabled
                    ? "Disable 2FA"
                    : "Enable 2FA"}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-11/12">
              <DialogHeader>
                <DialogTitle>
                  {session?.user.twoFactorEnabled
                    ? "Disable 2FA"
                    : "Enable 2FA"}
                </DialogTitle>
                <DialogDescription>
                  {session?.user.twoFactorEnabled
                    ? "Disable the second factor authentication from your account"
                    : "Enable 2FA to secure your account"}
                </DialogDescription>
              </DialogHeader>

              {twoFactorVerifyURI ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-center">
                    <QRCode value={twoFactorVerifyURI} />
                  </div>
                  <Label htmlFor="password">
                    Scan the QR code with your TOTP app
                  </Label>
                  <Input
                    value={twoFaPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTwoFaPassword(e.target.value)
                    }
                    placeholder="Enter OTP"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    placeholder="Password"
                    value={twoFaPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTwoFaPassword(e.target.value)
                    }
                  />
                </div>
              )}
              <DialogFooter>
                <Button
                  disabled={isPendingTwoFa}
                  onClick={async () => {
                    if (twoFaPassword.length < 8 && !twoFactorVerifyURI) {
                      toast.error("Password must be at least 8 characters");
                      return;
                    }
                    setIsPendingTwoFa(true);
                    if (session?.user.twoFactorEnabled) {
                      const res = await authClient.twoFactor.disable({
                        password: twoFaPassword,
                        fetchOptions: {
                          onError(context) {
                            toast.error(context.error.message);
                          },
                          onSuccess() {
                            toast.success("2FA disabled successfully");
                            setTwoFactorDialog(false);
                          },
                        },
                      });
                    } else {
                      if (twoFactorVerifyURI) {
                        await authClient.twoFactor.verifyTotp({
                          code: twoFaPassword,
                          fetchOptions: {
                            onError(context) {
                              setIsPendingTwoFa(false);
                              setTwoFaPassword("");
                              toast.error(context.error.message);
                            },
                            onSuccess() {
                              toast.success("2FA enabled successfully");
                              setTwoFactorVerifyURI("");
                              setIsPendingTwoFa(false);
                              setTwoFaPassword("");
                              setTwoFactorDialog(false);
                            },
                          },
                        });
                        return;
                      }
                      const res = await authClient.twoFactor.enable({
                        password: twoFaPassword,
                        fetchOptions: {
                          onError(context) {
                            toast.error(context.error.message);
                          },
                          onSuccess(ctx) {
                            setTwoFactorVerifyURI(ctx.data.totpURI);
                          },
                        },
                      });
                    }
                    setIsPendingTwoFa(false);
                    setTwoFaPassword("");
                  }}
                >
                  {isPendingTwoFa ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : session?.user.twoFactorEnabled ? (
                    "Disable 2FA"
                  ) : (
                    "Enable 2FA"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Separator />

      {/* Manage Password */}
      <div className="w-full gap-3 flex flex-col">
        <p className="font-medium mb-2">Manage Password</p>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap">
            <ChangePassword />
          </div>
        </div>
      </div>
      <Separator />

      {/* Backup Codes */}
      <p className="font-medium mb-2">Manage Backup Codes</p>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 flex-wrap">
          <BackupCodes />
        </div>
      </div>
      <Separator />

      {/* Danger Zone */}
      <div className="w-full gap-3 flex flex-col">
        <p className="font-medium mb-2">Danger Zone</p>
        <div className="flex flex-col gap-2">
          <DangerZone />
        </div>
      </div>
    </div>
  );
};

export default SettingsSecurityPage;

const AddPasskey = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [passkeyName, setPasskeyName] = useState("");
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPasskey = async () => {
    if (!passkeyName) {
      toast.error("Passkey name is required");
      return;
    }
    setIsLoading(true);
    const res = await authClient.passkey.addPasskey({
      name: passkeyName,
    });
    if (res?.error) {
      toast.error(res?.error.message);
    } else {
      setIsOpen(false);
      toast.success("Passkey added successfully. You can now use it to login.");
    }
    setIsLoading(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-xs md:text-sm">
          <Plus size={15} />
          Add New Passkey
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Add New Passkey</DialogTitle>
          <DialogDescription>
            Create a new passkey to securely access your account without a
            password.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="passkey-name">Passkey Name</Label>
          <Input
            id="passkey-name"
            value={passkeyName}
            onChange={(e) => setPasskeyName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            disabled={isLoading}
            type="submit"
            onClick={handleAddPasskey}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                <Fingerprint className="mr-2 h-4 w-4" />
                Create Passkey
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ListPasskeys = () => {
  const { data, error } = authClient.useListPasskeys();
  const [isOpen, setIsOpen] = useState(false);
  const [passkeyName, setPasskeyName] = useState("");

  const handleAddPasskey = async () => {
    if (!passkeyName) {
      toast.error("Passkey name is required");
      return;
    }
    setIsLoading(true);
    const res = await authClient.passkey.addPasskey({
      name: passkeyName,
    });
    setIsLoading(false);
    if (res?.error) {
      toast.error(res?.error.message);
    } else {
      toast.success("Passkey added successfully. You can now use it to login.");
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletePasskey, setIsDeletePasskey] = useState<boolean>(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-xs md:text-sm">
          <Fingerprint className="mr-2 h-4 w-4" />
          <span>Passkeys {data?.length ? `[${data?.length}]` : ""}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Passkeys</DialogTitle>
          <DialogDescription>List of passkeys</DialogDescription>
        </DialogHeader>
        {data?.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((passkey) => (
                <TableRow
                  key={passkey.id}
                  className="flex  justify-between items-center"
                >
                  <TableCell>{passkey.name || "My Passkey"}</TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={async () => {
                        const res = await authClient.passkey.deletePasskey({
                          id: passkey.id,
                          fetchOptions: {
                            onRequest: () => {
                              setIsDeletePasskey(true);
                            },
                            onSuccess: () => {
                              toast("Passkey deleted successfully");
                              setIsDeletePasskey(false);
                            },
                            onError: (error) => {
                              toast.error(error.error.message);
                              setIsDeletePasskey(false);
                            },
                          },
                        });
                      }}
                    >
                      {isDeletePasskey ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2
                          size={15}
                          className="cursor-pointer text-red-600"
                        />
                      )}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No passkeys found</p>
        )}
        {!data?.length && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="passkey-name" className="text-sm">
                New Passkey
              </Label>
              <Input
                id="passkey-name"
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
                placeholder="My Passkey"
              />
            </div>
            <Button type="submit" onClick={handleAddPasskey} className="w-full">
              {isLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Create Passkey
                </>
              )}
            </Button>
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [signOutDevices, setSignOutDevices] = useState<boolean>(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 z-10" variant="outline">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M2.5 18.5v-1h19v1zm.535-5.973l-.762-.442l.965-1.693h-1.93v-.884h1.93l-.965-1.642l.762-.443L4 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L4 10.835zm8 0l-.762-.442l.966-1.693H9.308v-.884h1.93l-.965-1.642l.762-.443L12 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L12 10.835zm8 0l-.762-.442l.966-1.693h-1.931v-.884h1.93l-.965-1.642l.762-.443L20 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L20 10.835z"
            ></path>
          </svg>
          <span className="text-sm text-muted-foreground">Change Password</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Change your password</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="current-password">Current Password</Label>
          <PasswordInput
            id="current-password"
            value={currentPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCurrentPassword(e.target.value)
            }
            autoComplete="new-password"
            placeholder="Password"
          />
          <Label htmlFor="new-password">New Password</Label>
          <PasswordInput
            value={newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewPassword(e.target.value)
            }
            autoComplete="new-password"
            placeholder="New Password"
          />
          <Label htmlFor="password">Confirm Password</Label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
            autoComplete="new-password"
            placeholder="Confirm Password"
          />
          <div className="flex gap-2 items-center">
            <Checkbox
              onCheckedChange={(checked) =>
                checked ? setSignOutDevices(true) : setSignOutDevices(false)
              }
            />
            <p className="text-sm">Sign out from other devices</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              if (newPassword !== confirmPassword) {
                toast.error("Passwords do not match");
                return;
              }
              if (newPassword.length < 8) {
                toast.error("Password must be at least 8 characters");
                return;
              }
              setLoading(true);
              const res = await authClient.changePassword({
                newPassword: newPassword,
                currentPassword: currentPassword,
                revokeOtherSessions: signOutDevices,
              });
              setLoading(false);
              if (res.error) {
                toast.error(
                  res.error.message ||
                    "Couldn't change your password! Make sure it's correct"
                );
              } else {
                setOpen(false);
                toast.success("Password changed successfully");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }
            }}
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              "Change Password"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DangerZone = () => {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    // Add your delete account logic here
    console.log("Account deletion initiated");
    setOpen(false);
  };

  return (
    <div className="w-full">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start justify-between">
          <div className="space-y-1 mb-4 md:mb-0">
            <h4 className="font-medium text-red-900">Delete Account</h4>
            <p className="text-sm text-red-700">
              Permanently remove your account and all associated data.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-11/12">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Account
                </DialogTitle>
                <div className="text-sm space-y-4">
                  <h3 className="mb-2 font-medium text-red-900">
                    This action will:
                  </h3>
                  <ul className="list-inside space-y-2 text-red-800">
                    <li>• Permanently delete your entire account.</li>
                    <li>• Immediately erase all your data.</li>
                    <li>• Remove access to all services and features.</li>
                    <li>• Delete all saved preferences and settings.</li>
                  </ul>
                  <p className="mt-4 font-medium text-red-900">
                    This action cannot be reversed or undone.
                  </p>
                </div>
              </DialogHeader>
              <DialogFooter className="sm:justify-start">
                <div className="flex w-full gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDelete}
                    disabled={true}
                  >
                    Confirm
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

const SessionButton = ({
  sessionId,
  currentSessionId,
}: {
  sessionId: string;
  currentSessionId: string;
}) => {
  const router = useRouter();
  const [isTerminating, setIsTerminating] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const isCurrentSession = sessionId === currentSessionId;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess() {
          toast.success("You've successfully signed out.");
          redirect("/");
        },
      },
    });
    setIsSigningOut(false);
  };

  const handleRevokeSession = async () => {
    setIsTerminating(true);
    const res = await authClient.revokeSession({
      token: sessionId,
    });

    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success("Session terminated successfully");
    }
    router.refresh();
    setIsTerminating(false);
  };

  if (isTerminating || isSigningOut) {
    return (
      <Button
        className="text-red-500 bg-transparent hover:bg-transparent"
        disabled
      >
        <Loader2 size={15} className="animate-spin" />
      </Button>
    );
  }

  if (isCurrentSession) {
    return (
      <Button
        variant="destructive"
        className="gap-2"
        onClick={handleSignOut}
        disabled={isSigningOut}
      >
        Sign Out
      </Button>
    );
  }

  return (
    <Button
      variant="destructive"
      className="text-red-800 bg-transparent hover:bg-transparent"
      onClick={handleRevokeSession}
    >
      <Trash2 className="h-5 w-5" />
    </Button>
  );
};

const BackupCodes = () => {
  const [open, setOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateBackupCodes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.twoFactor.generateBackupCodes({
        password,
      });
      if (error) {
        throw new Error(error.message);
      }
      setPassword("");
      setBackupCodes(data.backupCodes);
      setPasswordDialogOpen(false);
      setOpen(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate backup codes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    const timestamp = new Date().toLocaleString();
    const message = `Backup codes generated on: ${timestamp}\n\n`;
    const codesString = message + backupCodes.join("\n");
    navigator.clipboard
      .writeText(codesString)
      .then(() => {
        toast.success("Backup codes copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy backup codes.");
      });
  };

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => setPasswordDialogOpen(true)}
        disabled={isLoading}
      >
        Generate Backup Codes
      </Button>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px] w-11/12">
          <DialogHeader>
            <DialogTitle>Verify Password</DialogTitle>
            <DialogDescription>
              Please enter your password to generate backup codes.
            </DialogDescription>
          </DialogHeader>
          <PasswordInput
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            placeholder="Enter your password"
          />
          <DialogFooter className="gap-2">
            <Button onClick={handleGenerateBackupCodes} disabled={isLoading}>
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
            <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] w-11/12">
          <DialogHeader>
            <DialogTitle>Backup Codes</DialogTitle>
            <DialogDescription>
              These backup codes can be used to access your account if you lose
              access to your two-factor authentication device.
            </DialogDescription>
          </DialogHeader>
          {backupCodes.length > 0 ? (
            <div className="flex flex-col gap-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="p-2 border">
                  {code}
                </div>
              ))}
              <Button
                onClick={handleCopyToClipboard}
                variant="outline"
                className="mt-2"
              >
                <Copy size={15} className="mr-2 h-4 w-4" />
                Copy All to Clipboard
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No backup codes generated yet.
            </p>
          )}

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const getLocationFromIP = async (ip: string) => {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    return response.json();
  } catch (error) {
    return null;
  }
};

const splitIPv6AndIPv4 = (
  ip: string
): { ipv6: string | null; ipv4: string | null; message?: string } => {
  // Check for loopback address
  if (ip === "::1") {
    return {
      ipv6: ip,
      ipv4: "127.0.0.1",
      message: "This is the loopback address (localhost).",
    };
  }

  const parts = ip.split(":");

  // Check if the last part contains a dot, indicating an IPv4 address
  if (parts[parts.length - 1].includes(".")) {
    const ipv4 = parts.slice(-1)[0];
    const ipv6 = parts.slice(0, -1).join(":");
    return { ipv6, ipv4 };
  } else {
    return { ipv6: ip, ipv4: null };
  }
};

const ActiveSession = ({
  session,
  currentSession,
}: {
  session: Session["session"];
  currentSession: Session;
}) => {
  const [location, setLocation] = useState<{
    city: string;
    region: string;
    country: string;
  } | null>(null);
  const [browserInfo, setBrowserInfo] = useState<string | null>(null);
  const [osInfo, setOsInfo] = useState<string | null>(null);
  const [loadingBrowserInfo, setLoadingBrowserInfo] = useState<boolean>(true);
  const { ipv6, ipv4, message } = splitIPv6AndIPv4(session.ipAddress as string);

  useEffect(() => {
    // This code will only run on the client
    const parser = new UAParser(session.userAgent || "");
    const browser = parser.getBrowser();
    const os = parser.getOS();
    setBrowserInfo(`${browser.name} ${browser.version}`);
    setOsInfo(`${os.name} ${os.version}`);
    setLoadingBrowserInfo(false);
  }, [session.userAgent]);

  useEffect(() => {
    const fetchLocation = async () => {
      if (ipv4 === "127.0.0.1" || ipv6 === "::1") {
        setLocation(null);
        return;
      }

      const loc = await getLocationFromIP(ipv4 as string);
      if (loc) {
        setLocation({
          city: loc.city || "Unknown",
          region: loc.region || "Unknown",
          country: loc.country || "Unknown",
        });
      }
    };
    fetchLocation();
  }, [session.ipAddress]);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 rounded-lg bg-background p-4 md:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
        {new UAParser(session.userAgent || "").getDevice().type === "mobile" ? (
          <Smartphone />
        ) : (
          <Laptop size={28} />
        )}
      </div>
      <div className="grid gap-2 w-full md:w-auto">
        <div className="font-medium text-sm md:text-base">
          {loadingBrowserInfo ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <>
              {osInfo && <span>{osInfo}, </span>}
              {browserInfo || "Unknown Browser"}
            </>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">IP Address:</span>
          <br />
          {message && (
            <>
              <span>{message}</span>
              <br />
            </>
          )}
          {ipv4 && <span>IPv4: {ipv4}</span>}
          <br />
          {ipv6 && <span>IPv6: {ipv6}</span>}
          <br />
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Location:</span>
          {location
            ? `${location.city}, ${location.region}, ${location.country}`
            : "Location not available for localhost."}
        </div>
      </div>
      <div className="flex flex-row md:ml-auto items-center gap-3 w-full md:w-auto justify-end mt-4 md:mt-0">
        {session.id === currentSession?.session.id ? (
          <Badge variant="secondary">Current Session</Badge>
        ) : null}
        <SessionButton
          sessionId={session.id}
          currentSessionId={currentSession.session.id}
        />
      </div>
    </div>
  );
};
