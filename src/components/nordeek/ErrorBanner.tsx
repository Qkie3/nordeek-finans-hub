import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <Alert variant="destructive" className="border-destructive/60 bg-destructive/5">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Fejl</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export default ErrorBanner;
