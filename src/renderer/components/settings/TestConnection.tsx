import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function TestConnection() {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  const testConnectionMutation = useMutation({
    mutationFn: () => window.ado.auth.test(),
    onSuccess: (result) => {
      setTestResult(result);
    },
  });

  return (
    <div className="rounded-xl border border-alpha/5 bg-gray-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-alpha/5">
        <h2 className="font-semibold text-gray-950">Test Connection</h2>
      </div>
      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-500">
          Verify your Azure DevOps configuration is working correctly.
        </p>
        <Button
          onClick={() => {
            setTestResult(null);
            testConnectionMutation.mutate();
          }}
          disabled={testConnectionMutation.isPending}
          variant="outline"
        >
          {testConnectionMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Testing...</span>
            </>
          ) : (
            "Test Connection"
          )}
        </Button>

        {testResult && (
          <div
            className={`flex items-start gap-3 rounded-lg p-3 ${
              testResult.success ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="size-5 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="size-5 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">
                {testResult.success ? "Connection successful!" : "Connection failed"}
              </p>
              {testResult.error && <p className="text-sm mt-1 opacity-80">{testResult.error}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
