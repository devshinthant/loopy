import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCcw, WifiOff } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router";

export function SocketErrorPage() {
  const navigate = useNavigate();
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
            className="w-full cursor-pointer group bg-gray-800 hover:bg-gray-700"
            variant="outline"
            onClick={() => navigate("/")}
          >
            <RefreshCcw className="h-4 group-hover:rotate-90 transition-all group-hover:text-gray-100 duration-300 w-4 text-gray-300" />
            <span className="text-gray-300 group-hover:text-gray-100 transition-all duration-300">
              Retry
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
