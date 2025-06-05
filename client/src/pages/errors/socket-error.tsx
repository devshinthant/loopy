import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WifiOff, Settings } from "lucide-react";
import { useCallback } from "react";

export function SocketErrorPage() {
  const getErrorContent = useCallback(() => {
    return {
      icon: <WifiOff className="h-6 w-6 text-red-500" />,
      title: "Connection Error",
      description:
        "Failed to connect to the server. This might be due to network issues or server overload.",
      showRetry: true,
    };
  }, []);

  const errorContent = getErrorContent();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-800">
            {errorContent.icon}
          </div>
          <CardTitle className="text-gray-100">{errorContent.title}</CardTitle>
          <CardDescription className="text-gray-400">
            {errorContent.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-200">
              Troubleshooting steps:
            </h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Disable VPN or proxy if enabled</li>
              <li>• Try refreshing the page</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </div>

          <Button
            variant="ghost"
            className="w-full relative overflow-hidden text-gray-400 hover:text-gray-300 bg-gray-900/50 hover:bg-gray-800/30 transition-all duration-300 ease-in-out backdrop-blur-md border-2 border-gray-700/30 hover:border-gray-600/50 rounded-xl px-8 py-3 group"
            onClick={() => window.location.reload()}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <Settings className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-180" />
            <span className="relative">Refresh Page</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
