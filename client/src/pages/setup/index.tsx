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
import { useState } from "react";

import { Navigate, useNavigate } from "react-router";

import { socket } from "@/lib/socket";
import setUpRouter from "@/lib/setUpRouter";
import useRoomStore from "@/store/room";
import useTransportsStore from "@/store/transports";
import { toast } from "sonner";
import { Loader, Video, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { UserButton, useUser } from "@clerk/clerk-react";
import Loading from "@/components/loading";
import useSocketStore from "@/store/socket";

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

  const { setRtpCapabilities, setDevice } = useRoomStore();
  const { setReceiveTransport, setProduceTransport } = useTransportsStore();
  const { isConnected } = useSocketStore();
  const { user, isLoaded } = useUser();

  const [loading, setLoading] = useState({
    joinRoom: false,
    createRoom: false,
  });

  const form = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomName: "",
      password: "",
    },
  });

  function onJoinRoom(values: z.infer<typeof roomSchema>) {
    setLoading({
      ...loading,
      joinRoom: true,
    });
    if (!user) {
      return toast.error("You are not logged in.");
    }

    socket.emit(
      "joinRoom",
      {
        roomId: values.roomName,
        password: values.password,
        userData: {
          id: user.id,
          name: user.fullName,
          email: user.emailAddresses[0].emailAddress,
          imageUrl: user.imageUrl,
          isHost: false,
        },
      },
      (data: {
        message: string;
        error: string;
        participantCount: number;
        roomCreatedAt: string;
      }) => {
        if (data.error) {
          setLoading({
            ...loading,
            joinRoom: false,
          });
          return toast.error(data.error, {
            description: <p className="text-black">Please try again.</p>,
          });
        }
        if (data.message) {
          console.log(data.message);
        }

        setUpRouter({
          roomId: values.roomName,
          setRtpCapabilities,
          setDevice,
          setReceiveTransport,
          setProduceTransport,
        });

        setLoading({
          ...loading,
          joinRoom: false,
        });

        navigate(`/preview`, {
          state: {
            roomId: values.roomName,
            participantCount: data.participantCount,
            roomCreatedAt: data.roomCreatedAt,
          },
        });
      }
    );
  }

  function onCreateRoom() {
    if (Object.keys(form.formState.errors).length > 0) {
      return console.log("Invalid form", form.formState.errors);
    }

    setLoading({
      ...loading,
      createRoom: true,
    });

    const values = form.getValues();

    if (!user) {
      return toast.error("You are not logged in.");
    }

    socket.emit(
      "createRoom",
      {
        roomId: values.roomName,
        password: values.password,
        userData: {
          id: user.id,
          name: user.fullName,
          email: user.emailAddresses[0].emailAddress,
          imageUrl: user.imageUrl,
          isHost: true,
        },
      },
      (data: { message: string; error: string; roomCreatedAt: string }) => {
        if (data.error) {
          toast.error(data.error, {
            description: <p className="text-black">Please try again.</p>,
          });
          setLoading({
            ...loading,
            createRoom: false,
          });
          return console.log(data.error);
        }
        if (data.message) {
          console.log(data.message);
        }

        setUpRouter({
          roomId: values.roomName,
          setRtpCapabilities,
          setDevice,
          setReceiveTransport,
          setProduceTransport,
        });

        setLoading({
          ...loading,
          createRoom: false,
        });

        navigate(`/room/${values.roomName}`, {
          state: {
            type: "create",
            roomCreatedAt: data.roomCreatedAt,
          },
        });
        toast.success("Room created.", {
          description: (
            <p className="text-black">
              You can now start the video conference.
            </p>
          ),
        });
      }
    );
  }

  if (!user) {
    return (
      <div>
        <div>
          <h1>You are not logged in.</h1>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return <Navigate to="/socket-error" />;
  }

  if (!isLoaded) {
    return <Loading />;
  }

  return (
    <div className="w-dvw h-dvh relative flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <Card className="w-full backdrop-blur-sm bg-black/40 border-gray-800/50 shadow-2xl">
          <CardHeader className="space-y-3">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center mb-2"
            >
              <Video className="w-12 h-12 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-center text-white">
              Video Conference
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Set up your room details to start a video conference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onJoinRoom)}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="roomName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">
                            Room Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="My Video Conference"
                              className="bg-black/50 border-gray-800 text-white placeholder:text-gray-500 focus:border-gray-600 transition-colors"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="password"
                                placeholder="********"
                                className="bg-black/50 border-gray-800 text-white placeholder:text-gray-500 focus:border-gray-600 transition-colors pl-10"
                                {...field}
                              />
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <Button
                      variant="outline"
                      type="submit"
                      className="w-full bg-black/50 hover:bg-black/70 hover:text-gray-200 cursor-pointer text-white border-gray-800 hover:border-gray-700 transition-all duration-300"
                      disabled={loading.joinRoom}
                    >
                      {loading.joinRoom ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Joining Room...</span>
                        </div>
                      ) : (
                        "Join Existing Room"
                      )}
                    </Button>
                    <Button
                      onClick={onCreateRoom}
                      type="button"
                      className="w-full bg-white hover:bg-gray-200 cursor-pointer text-black transition-all duration-300"
                      disabled={loading.createRoom}
                    >
                      {loading.createRoom ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Creating Room...</span>
                        </div>
                      ) : (
                        "Create Room"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>

      <div className="absolute right-10 top-10 ">
        {user ? <UserButton /> : null}
      </div>
    </div>
  );
}
