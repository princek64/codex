'use client';

import type { Origin, Process, Roast } from '@/types/brew';

const origins: Origin[] = ['Ethiopia', 'Colombia', 'Panama', 'Kenya'];
const processes: Process[] = ['Washed', 'Natural', 'Honey'];
const roasts: Roast[] = ['Light', 'Medium'];

export interface BeanFilters {
  origin: Origin | 'All';
  process: Process | 'All';
  roast: Roast | 'All';
}

interface BeanFilterProps {
  filters: BeanFilters;
  onChange: (filters: BeanFilters) => void;
}

export function BeanFilter({ filters, onChange }: BeanFilterProps) {
  return (
    <div className="card space-y-4 p-5">
      <div>
        <p className="eyebrow">Bean categories</p>
        <h2 className="mt-2 text-2xl font-semibold text-espresso">Filter by coffee profile</h2>
      </div>
      <FilterGroup label="Origin" values={origins} value={filters.origin} onSelect={(origin) => onChange({ ...filters, origin: origin as BeanFilters['origin'] })} />
      <FilterGroup label="Process" values={processes} value={filters.process} onSelect={(process) => onChange({ ...filters, process: process as BeanFilters['process'] })} />
      <FilterGroup label="Roast" values={roasts} value={filters.roast} onSelect={(roast) => onChange({ ...filters, roast: roast as BeanFilters['roast'] })} />
    </div>
  );
}

function FilterGroup({ label, values, value, onSelect }: { label: string; values: string[]; value: string; onSelect: (value: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {['All', ...values].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${value === item ? 'border-espresso bg-espresso text-white' : 'border-stone-200 bg-white text-stone-600 hover:border-caramel'}`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
