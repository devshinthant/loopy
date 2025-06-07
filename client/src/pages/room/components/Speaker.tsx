import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Tooltip } from "@/components/ui/tooltip";
import { Volume2 } from "lucide-react";
import DeviceOptions from "./DeviceOptions";
import { useParams } from "react-router";

export default function Speaker() {
  const params = useParams();
  const roomId = params.roomId as string;
  return (
    <div className="flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={"outline"}
                  size="icon"
                  className={
                    "rounded-full w-16 cursor-pointer border-gray-700 bg-gray-900 hover:bg-gray-800"
                  }
                >
                  <Volume2 className="h-5 w-5 text-white" />
                  <ChevronDown className="h-4 w-4 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-gray-900 border border-gray-700">
                <DropdownMenuLabel className="text-gray-200! font-medium">
                  Speaker Settings
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <div className="p-2">
                  <DeviceOptions roomId={roomId} type="audio-output" />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent side="top">Select Speaker</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
