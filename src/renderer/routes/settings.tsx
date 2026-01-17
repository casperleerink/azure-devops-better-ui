import { ConnectionSettings, PatSettings, TestConnection } from "@/components/settings";

export function SettingsPage() {
  return (
    <div className="h-full bg-gray-50">
      <div className="border-b border-alpha/5 bg-gray-50 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-950">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your Azure DevOps connection</p>
      </div>

      <div className="p-6">
        <div className="max-w-2xl space-y-6">
          <ConnectionSettings />
          <PatSettings />
          <TestConnection />
        </div>
      </div>
    </div>
  );
}
