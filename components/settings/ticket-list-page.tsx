"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Session } from "@/types/auth";
import { Ticket } from "@prisma/client";

interface TicketListPageProps {
  session: Session;
  tickets: Ticket[] | null;
  error?: string | null;
}


const statusColors = {
  Open: "bg-yellow-500",
  "In Progress": "bg-blue-500",
  Closed: "bg-green-500",
} as const;

const TicketListPage: React.FC<TicketListPageProps> = ({ 
  session, 
  tickets = [], 
  error 
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  // Get unique categories from actual tickets
  const categories = React.useMemo(() => {
    if (!tickets) return [];
    return Array.from(new Set(tickets.map(ticket => ticket.category)));
  }, [tickets]);

  const filteredTickets = React.useMemo(() => {
    if (!tickets) return [];
    return tickets.filter(
      (ticket) =>
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter === "all" || ticket.category === categoryFilter)
    );
  }, [tickets, searchTerm, categoryFilter]);

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Support</h3>
        <p className="text-sm text-muted-foreground">
          When agents have problems, they open support tickets.
        </p>
      </div>
      <Separator />

      <div className="flex space-x-4">
        <Input
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => router.push("/submit-ticket")}>
          Create New Ticket
        </Button>
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {/* <TableHead>ID</TableHead> */}
              <TableHead>Subject</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                {/* <TableCell>{ticket.id}</TableCell> */}
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>{ticket.category}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      statusColors[ticket.status as keyof typeof statusColors]
                    }
                  >
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>{ticket.priority}</TableCell>
                <TableCell>
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/ticket/${ticket.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <CardTitle>{ticket.subject}</CardTitle>
              <CardDescription>
                Created on {new Date(ticket.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Badge
                  variant={
                    ticket.status === "Open"
                      ? "destructive"
                      : ticket.status === "In Progress"
                      ? "default"
                      : "secondary"
                  }
                >
                  {ticket.status}
                </Badge>
                <span className="text-sm text-gray-500">
                  Priority: {ticket.priority}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => router.push(`/ticket/${ticket.id}`)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-4">
          No tickets found. Try adjusting your search or filter.
        </div>
      )}
    </div>
  );
};

export default TicketListPage;