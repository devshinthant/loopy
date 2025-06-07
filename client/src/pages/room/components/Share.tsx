import { TooltipContent } from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { TooltipTrigger } from "@/components/ui/tooltip";

import { Tooltip } from "@/components/ui/tooltip";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ArrowUp } from "lucide-react";

export default function Share() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            className="rounded-md cursor-pointer hover:bg-green-600 bg-green-500"
          >
            <ArrowUp strokeWidth={2.2} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Share</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
