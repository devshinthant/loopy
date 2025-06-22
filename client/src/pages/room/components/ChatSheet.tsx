import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Send, Paperclip, Smile } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useParticipantsStore } from "@/store/participants";
import useListenMessages from "@/hooks/useMessages";
import { useParams } from "react-router";
import useUserTyping from "@/hooks/useUserTyping";

import ChatNotiButton from "./ChatNoti";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  message: z.string().min(1).max(50),
});

export default function ChatSheet() {
  const params = useParams();
  const roomId = params.roomId as string;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const { participants } = useParticipantsStore();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { sendMessage, messages, setNotiCount, notiCount } = useListenMessages({
    roomId,
    disableNotifications: isSheetOpen,
  });

  const { typingUsers, handleTyping } = useUserTyping(roomId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* Scroll to bottom when messages change */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* Scroll to bottom when sheet opens */
  useEffect(() => {
    if (isSheetOpen) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isSheetOpen]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      form.formState.isValid &&
      form.getValues("message").trim().length
    ) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    sendMessage(values.message);
    form.reset();
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <ChatNotiButton count={notiCount} setCount={setNotiCount} />
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[540px] p-0 bg-gray-950 border-l border-gray-800"
      >
        <SheetHeader className="border-b border-gray-800 p-4 bg-gray-950">
          <SheetTitle className="text-white">Chat</SheetTitle>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {participants.length + 1} participants
          </div>
        </SheetHeader>

        <div className="flex flex-col overflow-y-auto h-full bg-gray-950">
          {/* Messages Area */}
          <div className="flex-1 h-full overflow-y-scroll p-4 space-y-4 bg-gray-950">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-3", {
                  "flex-row-reverse": message.isOwn,
                })}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={message.userData.imageUrl}
                    alt={message.userData.name}
                  />
                  <AvatarFallback className="bg-gray-700 text-white text-xs">
                    {message.userData.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn("flex flex-col max-w-[70%]", {
                    "items-end": message.isOwn,
                  })}
                >
                  <div
                    className={cn("rounded-lg px-3 py-2 text-sm", {
                      "bg-blue-600 text-white": message.isOwn,
                      "bg-gray-800 text-white": !message.isOwn,
                    })}
                  >
                    {message.message}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {message.userData.name}
                    </span>
                    <span className="text-xs text-gray-600">
                      {formatTime(new Date(message.createdAt))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {Object.values(typingUsers).map((user) => (
            <div
              key={user.id}
              className="flex py-2 px-4 items-center text-xs font-semibold text-gray-500 italic gap-2"
            >
              {user.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt={user.name}
                  className="w-4 h-4 rounded-full"
                />
              )}
              <span>{user.name} is typing</span>
              <span className="inline-flex">
                <span className="animate-pulse">.</span>
                <span
                  className="animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                >
                  .
                </span>
                <span
                  className="animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                >
                  .
                </span>
              </span>
            </div>
          ))}

          {/* Input Area */}
          <div className="border-t border-gray-800 p-4 bg-gray-950">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div className="flex-1 flex items-center gap-2 relative">
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              value={field.value}
                              onChange={(e) => {
                                handleTyping();
                                field.onChange(e);
                              }}
                              onKeyDown={handleKeyPress}
                              placeholder="Type a message..."
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 pr-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={!form.formState.isValid}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
