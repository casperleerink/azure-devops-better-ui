import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Key } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PatSettings() {
  const queryClient = useQueryClient();
  const [pat, setPat] = useState("");

  const { data: hasPat } = useQuery({
    queryKey: ["hasPat"],
    queryFn: () => window.ado.auth.hasPat(),
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

  const handleSavePat = () => {
    if (pat) {
      savePatMutation.mutate(pat);
    }
  };

  return (
    <div className="rounded-xl border border-alpha/5 bg-gray-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-alpha/5 flex items-center justify-between">
        <h2 className="font-semibold text-gray-950">Personal Access Token</h2>
        {hasPat ? (
          <Badge variant="green-subtle" size="xs" icon={<CheckCircle />} text="Configured" />
        ) : (
          <Badge variant="yellow-subtle" size="xs" icon={<AlertCircle />} text="Not configured" />
        )}
      </div>
      <div className="p-4 space-y-4">
        <div>
          <Label className="mb-2 block">{hasPat ? "Update PAT" : "Enter PAT"}</Label>
          <InputWithIcon
            iconLeft={<Key className="text-gray-400" />}
            type="password"
            value={pat}
            onChange={(e) => setPat(e.target.value)}
            placeholder="Enter your Personal Access Token"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSavePat}
            disabled={savePatMutation.isPending || !pat}
            variant="primary"
          >
            {savePatMutation.isPending ? "Saving..." : "Save PAT"}
          </Button>
          {hasPat && (
            <Button
              onClick={() => clearPatMutation.mutate()}
              disabled={clearPatMutation.isPending}
              variant="red-subtle"
            >
              Clear PAT
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
