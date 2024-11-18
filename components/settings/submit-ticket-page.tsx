"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import {
  ACCEPTED_FILE_TYPES,
  submitTicketFormSchema,
} from "@/schemas/settings";
import { Session } from "@/types/auth";
import { redirect } from "next/navigation";

const SubmitTicketPage = ({ session }: { session: Session }) => {
  if (!session) redirect("/login");

  const form = useForm<z.infer<typeof submitTicketFormSchema>>({
    resolver: zodResolver(submitTicketFormSchema),
    defaultValues: {
      category: "",
      subject: "",
      message: "",
    },
  });

  const [fileNames, setFileNames] = React.useState<string[]>([]);

  const onSubmit = (values: z.infer<typeof submitTicketFormSchema>) => {};

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Submit a Support Ticket</h1>
      <div className="flex items-center gap-4">
        <Avatar className="hidden h-9 w-9 sm:flex ">
          <AvatarImage
            src={session.user.image || "#"}
            alt="Avatar"
            className="object-cover"
          />
          <AvatarFallback>{session.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="text-sm font-medium leading-none">
            {session.user.name}
          </p>
          <p className="text-sm">{session.user.email}</p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the category that best fits your issue.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the priority level for your ticket.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Brief description of your issue"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a short summary of your issue.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please describe your issue in detail"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide as much detail as possible about your issue.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="attachments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attachments</FormLabel>
                <FormControl>
                  <div className="flex flex-col items-start space-y-2">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 px-2 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                        <Upload className="w-4 h-4" />
                        <span>Upload Files</span>
                      </div>
                    </label>
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={(event) => {
                        const files = event.target.files;
                        if (files) {
                          setFileNames(
                            Array.from(files).map((file) => file.name)
                          );
                          field.onChange(files);
                        }
                      }}
                      accept={ACCEPTED_FILE_TYPES.join(",")}
                      className="hidden"
                    />
                    {fileNames.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {fileNames.map((name, index) => (
                          <li key={index}>{name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  You can upload up to 3 files. Max size per file: 5MB. Accepted
                  formats: .jpg, .jpeg, .png, .pdf, .doc, .docx
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit Ticket</Button>
        </form>
      </Form>
    </div>
  );
};

export default SubmitTicketPage;
