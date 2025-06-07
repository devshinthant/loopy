import { TooltipContent } from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { TooltipTrigger } from "@/components/ui/tooltip";

import { Tooltip } from "@/components/ui/tooltip";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Hand } from "lucide-react";

export default function RaiseHand() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="rounded-md border-gray-700 hover:bg-gray-800 bg-gray-900 transition-colors duration-200"
          >
            <Hand className="h-5 w-5 text-white transition-colors duration-200 " />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <span className="text-amber-400">Raise Hand</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
