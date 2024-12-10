import { getSession } from "@/components/auth/get-session";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { redirect } from "next/navigation";

const AppLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <SidebarProvider>
      <AppSidebar variant="floating" collapsible="offcanvas" session={session} />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 p-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
