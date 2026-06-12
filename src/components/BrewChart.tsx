'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BrewCurvePoint, SessionPoint } from '@/types/brew';

export function BrewChart({ targetCurve, userCurve }: { targetCurve: BrewCurvePoint[]; userCurve?: SessionPoint[] }) {
  const mergedTimes = Array.from(new Set([...targetCurve.map((point) => point.time), ...(userCurve ?? []).map((point) => point.time)])).sort((a, b) => a - b);
  const data = mergedTimes.map((time) => ({
    time,
    target: targetCurve.find((point) => point.time === time)?.weight,
    user: userCurve?.find((point) => point.time === time)?.weight,
  }));

  return (
    <div className="h-64 w-full rounded-[2rem] bg-white p-3 shadow-inner shadow-stone-100">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 12, bottom: 4, left: -20 }}>
          <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: '#a8a29e', fontSize: 12 }} unit="s" />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#a8a29e', fontSize: 12 }} unit="g" />
          <Tooltip contentStyle={{ borderRadius: 18, border: '1px solid #eadfd2' }} labelFormatter={(label) => `${label}s`} />
          <Line type="monotone" dataKey="target" name="Target" stroke="#8f5a32" strokeWidth={3} dot={false} connectNulls />
          <Line type="monotone" dataKey="user" name="Your brew" stroke="#1f1a17" strokeWidth={3} dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
