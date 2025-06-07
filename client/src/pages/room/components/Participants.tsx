import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParticipantsStore } from "@/store/participants";
import useRemoteAudioStreamStore from "@/store/remote-audio-streams";
import { Users } from "lucide-react";

export default function Participants() {
  const { participants } = useParticipantsStore();
  console.log({ participants });
  const { remoteAudioStreams } = useRemoteAudioStreamStore();
  console.log({ remoteAudioStreams });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-md cursor-pointer border-gray-700 bg-gray-900 hover:bg-gray-800"
        >
          <Users className="h-5 w-5 text-white" />
          <p className="text-white text-xs ml-2">
            {participants.length} Joined
          </p>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 bg-gray-900 border border-gray-700">
        <DropdownMenuLabel className="text-gray-200 font-medium flex items-center justify-between">
          <span>Participants</span>
          <span className="text-xs text-gray-400">
            {participants.length} online
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <div className="max-h-[300px] overflow-y-auto">
          {participants.map((participant) => {
            const isPause = !remoteAudioStreams?.length
              ? true
              : remoteAudioStreams?.find(
                  (stream) => stream.emitterId === participant.id
                )?.paused;

            // console.log(
            //   remoteAudioStreams?.find(
            //     (stream) => stream.emitterId === participant.id
            //   )
            // );

            return (
              <DropdownMenuItem className="flex items-center gap-2 text-gray-200 hover:bg-gray-800! cursor-pointer">
                <div className="w-8 h-8">
                  <img
                    src={participant.imageUrl}
                    className="w-full h-full object-cover rounded-full"
                    alt={participant.name}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white">{participant.name}</span>
                  <span className="text-xs text-gray-400">
                    {participant.isHost ? "Host" : "Participant"}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isPause ? "bg-gray-500" : "bg-green-500"
                    }`}
                  ></div>
                  {isPause ? (
                    <span className="text-xs text-gray-400">Muted</span>
                  ) : (
                    <span className="text-xs text-gray-400">Speaking</span>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>
        <DropdownMenuSeparator className="bg-gray-700" />
        <div className="p-2">
          <Button
            variant="outline"
            className="w-full border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200!"
          >
            Invite People
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
