import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Smile } from "lucide-react";

export default function Reaction() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-md cursor-pointer border-gray-700 hover:bg-gray-800 bg-gray-900  transition-colors duration-200"
        >
          <Smile className="h-5 w-5 text-white transition-colors duration-200 " />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border border-gray-700">
        <DropdownMenuLabel className="text-yellow-500">
          Reactions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem className="text-gray-200! hover:bg-gray-800! cursor-pointer">
          Send Hearts ❤️
        </DropdownMenuItem>
        <DropdownMenuItem className="text-gray-200! hover:bg-gray-800! cursor-pointer">
          Send Applause 👏
        </DropdownMenuItem>
        <DropdownMenuItem className="text-gray-200! hover:bg-gray-800! cursor-pointer">
          Send Celebration 🎉
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
