import type { AdoConfig, AreaPath } from "@shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { InputWithIcon } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function ConnectionSettings() {
  const queryClient = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ["config"],
    queryFn: () => window.ado.config.get(),
  });

  const [organizationUrl, setOrganizationUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [selectedAreaPath, setSelectedAreaPath] = useState<AreaPath | null>(null);
  const [areaPathOpen, setAreaPathOpen] = useState(false);

  // Fetch area paths (only if we have a config)
  const { data: areaPaths, isLoading: areaPathsLoading } = useQuery({
    queryKey: ["areaPaths"],
    queryFn: () => window.ado.areaPaths.list(),
    enabled: !!config,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (config) {
      setOrganizationUrl(config.organizationUrl);
      setProjectName(config.projectName);
      // Find the matching area path object if we have one saved
      if (config.defaultAreaPath && areaPaths) {
        const found = areaPaths.find((ap) => ap.path === config.defaultAreaPath);
        setSelectedAreaPath(found ?? null);
      } else {
        setSelectedAreaPath(null);
      }
    }
  }, [config, areaPaths]);

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
        defaultAreaPath: selectedAreaPath?.path,
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
          <Popover open={areaPathOpen} onOpenChange={setAreaPathOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={!config || areaPathsLoading}
                className="w-full justify-between font-normal"
              >
                <span className={cn(!selectedAreaPath && "text-gray-400")}>
                  {areaPathsLoading
                    ? "Loading..."
                    : (selectedAreaPath?.path ?? "Select area path (optional)")}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search area paths..." />
                <CommandList>
                  <CommandEmpty>No area paths found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedAreaPath(null);
                        setAreaPathOpen(false);
                      }}
                    >
                      None (no filtering)
                      <Check
                        className={cn(
                          "ml-auto",
                          selectedAreaPath === null ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                    {areaPaths?.map((areaPath) => (
                      <CommandItem
                        key={areaPath.id}
                        onSelect={() => {
                          setSelectedAreaPath(areaPath);
                          setAreaPathOpen(false);
                        }}
                      >
                        {areaPath.path}
                        <Check
                          className={cn(
                            "ml-auto",
                            selectedAreaPath?.id === areaPath.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
