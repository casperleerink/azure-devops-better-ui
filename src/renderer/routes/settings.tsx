import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { AdoConfig } from "../../shared/types";

export function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ["config"],
    queryFn: () => window.ado.config.get(),
  });

  const { data: hasPat } = useQuery({
    queryKey: ["hasPat"],
    queryFn: () => window.ado.auth.hasPat(),
  });

  const [organizationUrl, setOrganizationUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [pat, setPat] = useState("");
  const [testResult, setTestResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (config) {
      setOrganizationUrl(config.organizationUrl);
      setProjectName(config.projectName);
    }
  }, [config]);

  const saveConfigMutation = useMutation({
    mutationFn: (newConfig: AdoConfig) => window.ado.config.set(newConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });

  const savePatMutation = useMutation({
    mutationFn: (newPat: string) => window.ado.auth.setPat(newPat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hasPat"] });
      setPat("");
    },
  });

  const clearPatMutation = useMutation({
    mutationFn: () => window.ado.auth.clearPat(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hasPat"] });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: () => window.ado.auth.test(),
    onSuccess: (result) => {
      setTestResult(result);
    },
  });

  const handleSaveConfig = () => {
    if (organizationUrl && projectName) {
      saveConfigMutation.mutate({
        organizationUrl: organizationUrl.replace(/\/$/, ""),
        projectName,
      });
    }
  };

  const handleSavePat = () => {
    if (pat) {
      savePatMutation.mutate(pat);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold">Settings</h1>

      <div className="max-w-xl space-y-8">
        {/* Organization Settings */}
        <section>
          <h2 className="mb-4 font-medium">Azure DevOps Connection</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Organization URL
              </label>
              <input
                type="url"
                value={organizationUrl}
                onChange={(e) => setOrganizationUrl(e.target.value)}
                placeholder="https://dev.azure.com/your-org"
                className="w-full rounded border border-input bg-background px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="MyProject"
                className="w-full rounded border border-input bg-background px-3 py-2"
              />
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={saveConfigMutation.isPending}
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saveConfigMutation.isPending ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </section>

        {/* PAT Settings */}
        <section>
          <h2 className="mb-4 font-medium">Personal Access Token</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`h-2 w-2 rounded-full ${
                  hasPat ? "bg-green-500" : "bg-yellow-500"
                }`}
              />
              <span>
                {hasPat ? "PAT is configured" : "PAT not configured"}
              </span>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                {hasPat ? "Update PAT" : "Enter PAT"}
              </label>
              <input
                type="password"
                value={pat}
                onChange={(e) => setPat(e.target.value)}
                placeholder="Enter your Personal Access Token"
                className="w-full rounded border border-input bg-background px-3 py-2"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSavePat}
                disabled={savePatMutation.isPending || !pat}
                className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {savePatMutation.isPending ? "Saving..." : "Save PAT"}
              </button>

              {hasPat && (
                <button
                  onClick={() => clearPatMutation.mutate()}
                  disabled={clearPatMutation.isPending}
                  className="rounded border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  Clear PAT
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Test Connection */}
        <section>
          <h2 className="mb-4 font-medium">Test Connection</h2>
          <div className="space-y-4">
            <button
              onClick={() => testConnectionMutation.mutate()}
              disabled={testConnectionMutation.isPending}
              className="rounded border border-input px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
            </button>

            {testResult && (
              <div
                className={`rounded border p-3 text-sm ${
                  testResult.success
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-destructive bg-destructive/10 text-destructive"
                }`}
              >
                {testResult.success
                  ? "Connection successful!"
                  : `Connection failed: ${testResult.error}`}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
