import type { AdoConfig } from "@shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderTree, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ConnectionSettings() {
  const queryClient = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ["config"],
    queryFn: () => window.ado.config.get(),
  });

  const [organizationUrl, setOrganizationUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [defaultAreaPath, setDefaultAreaPath] = useState("");

  useEffect(() => {
    if (config) {
      setOrganizationUrl(config.organizationUrl);
      setProjectName(config.projectName);
      setDefaultAreaPath(config.defaultAreaPath ?? "");
    }
  }, [config]);

  const saveConfigMutation = useMutation({
    mutationFn: (newConfig: AdoConfig) => window.ado.config.set(newConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });

  const handleSaveConfig = () => {
    if (organizationUrl && projectName) {
      saveConfigMutation.mutate({
        organizationUrl: organizationUrl.replace(/\/$/, ""),
        projectName,
        defaultAreaPath: defaultAreaPath.trim() || undefined,
      });
    }
  };

  return (
    <div className="rounded-xl border border-alpha/5 bg-gray-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-alpha/5">
        <h2 className="font-semibold text-gray-950">Azure DevOps Connection</h2>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <Label className="mb-2 block">Organization URL</Label>
          <InputWithIcon
            iconLeft={<Globe className="text-gray-400" />}
            type="url"
            value={organizationUrl}
            onChange={(e) => setOrganizationUrl(e.target.value)}
            placeholder="https://dev.azure.com/your-org"
          />
        </div>
        <div>
          <Label className="mb-2 block">Project Name</Label>
          <InputWithIcon
            iconLeft={<Globe className="text-gray-400" />}
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="MyProject"
          />
        </div>
        <div>
          <Label className="mb-2 block">Default Area Path</Label>
          <InputWithIcon
            iconLeft={<FolderTree className="text-gray-400" />}
            type="text"
            value={defaultAreaPath}
            onChange={(e) => setDefaultAreaPath(e.target.value)}
            placeholder="MyProject\Team\Area (optional)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Filter all work items by this area path. Leave empty for no filtering.
          </p>
        </div>
        <Button
          onClick={handleSaveConfig}
          disabled={saveConfigMutation.isPending || !organizationUrl || !projectName}
          variant="primary"
        >
          {saveConfigMutation.isPending ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
