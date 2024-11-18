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

// Mock data for tickets
const tickets = [
  {
    id: 1,
    subject: "Login issues",
    category: "Technical",
    status: "Open",
    createdAt: "2023-05-01",
  },
  {
    id: 2,
    subject: "Billing question",
    category: "Billing",
    status: "Closed",
    createdAt: "2023-05-02",
  },
  {
    id: 3,
    subject: "Feature request",
    category: "Feature",
    status: "In Progress",
    createdAt: "2023-05-03",
  },
  {
    id: 4,
    subject: "Account deletion",
    category: "Other",
    status: "Open",
    createdAt: "2023-05-04",
  },
  {
    id: 5,
    subject: "Performance issues",
    category: "Technical",
    status: "In Progress",
    createdAt: "2023-05-05",
  },
];

const statusColors = {
  Open: "bg-yellow-500",
  "In Progress": "bg-blue-500",
  Closed: "bg-green-500",
};

const TicketListPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === "all" || ticket.category === categoryFilter)
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Support</h3>
        <p className="text-sm text-muted-foreground">
          When agents have problems,they open suport tickets.
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
            <SelectItem value="Technical">Technical</SelectItem>
            <SelectItem value="Billing">Billing</SelectItem>
            <SelectItem value="Feature">Feature</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => router.push("/submit-ticket")}>
          Create New Ticket
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>{ticket.id}</TableCell>
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
              <TableCell>{ticket.createdAt}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/ticket/${ticket.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredTickets.length === 0 && (
        <div className="text-center py-4">
          No tickets found. Try adjusting your search or filter.
        </div>
      )}
    </div>
  );
};

export default TicketListPage;
