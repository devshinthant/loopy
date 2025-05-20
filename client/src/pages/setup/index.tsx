import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";

import { useNavigate } from "react-router";

import { io } from "socket.io-client";
import type {
  DtlsParameters,
  IceCandidate,
  IceParameters,
} from "mediasoup-client/types";
import { socket } from "@/lib/socket";

const roomSchema = z.object({
  roomName: z.string().min(1, {
    message: "Room name is required",
  }),
  password: z.string().min(4, {
    message: "Password must be at least 5 characters long",
  }),
});

export default function Setup() {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomName: "",
      password: "",
    },
  });

  function onJoinRoom(values: z.infer<typeof roomSchema>) {
    socket.emit(
      "joinRoom",
      {
        roomId: values.roomName,
        password: values.password,
      },
      (data: { message: string }) => {
        if (data.message) {
          console.log(data.message);
        }
        navigate(`/room/${values.roomName}`);
      }
    );
  }

  function onCreateRoom() {
    if (Object.keys(form.formState.errors).length > 0) {
      return console.log("Invalid form", form.formState.errors);
    }

    if (!socket) {
      return console.log("Socket not connected");
    }

    const values = form.getValues();

    socket.emit(
      "createRoom",
      {
        roomId: values.roomName,
        password: values.password,
      },
      (data: { message: string; error: string }) => {
        if (data.error) {
          return console.log(data.error);
        }
        navigate(`/room/${values.roomName}`);
      }
    );
  }

  useEffect(() => {
    const socket = io("http://localhost:4000/mediasoup");

    socket.on("connection-success", (data) => {
      console.log(data);
    });

    socket.on("WTF", (data) => {
      console.log(data);
    });

    // return () => {
    //   socket.disconnect();
    // };
  }, []);

  return (
    <div className="w-dvw h-dvh flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>A Room</CardTitle>
          <CardDescription>
            Set up your room details to start a video conference
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onJoinRoom)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="roomName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="My Video Conference"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Button variant="outline" type="submit" className="w-full">
                    Join Existing Room
                  </Button>
                  <Button
                    onClick={onCreateRoom}
                    type="button"
                    className="w-full"
                  >
                    Create Room
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
