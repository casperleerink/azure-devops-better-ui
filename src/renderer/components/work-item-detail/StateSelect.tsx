import type { WorkItemTypeState } from "@shared/types";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

interface StateSelectProps {
  value: string;
  states: WorkItemTypeState[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function StateSelect({ value, states, onChange, disabled }: StateSelectProps) {
  const currentState = states.find((s) => s.name === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-8 px-3 border border-alpha/10 rounded-lg gap-1.5 text-sm font-medium w-auto min-w-32">
        <div className="flex items-center gap-1.5">
          <div
            className="size-2 rounded-full"
            style={{
              backgroundColor: currentState?.color ? `#${currentState.color}` : undefined,
            }}
          />
          {value}
        </div>
      </SelectTrigger>
      <SelectContent>
        {states.map((s) => (
          <SelectItem key={s.name} value={s.name}>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full" style={{ backgroundColor: `#${s.color}` }} />
              {s.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
