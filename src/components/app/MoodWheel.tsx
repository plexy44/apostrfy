/**
 * @fileoverview This component renders a radial chart (a "mood wheel") to visualize
 * the primary emotion and confidence score from the sentiment analysis. It uses Recharts
 * to create the pie chart and dynamically styles it based on the detected emotion.
 */
"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"
import type { Emotion } from "@/lib/types";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const MOOD_COLORS_HSL: Record<Emotion, string> = {
  Joy: "hsl(var(--mood-joy))",
  Hope: "hsl(var(--mood-hope))",
  Awe: "hsl(var(--mood-awe))",
  Serenity: "hsl(var(--mood-serenity))",
  Melancholy: "hsl(var(--mood-melancholy))",
  Tension: "hsl(var(--mood-tension))",
  Fear: "hsl(var(--mood-fear))",
  Sadness: "hsl(var(--mood-sadness))",
  Morose: "hsl(var(--mood-morose))",
};


interface MoodWheelProps {
    mood: Emotion;
    score: number;
}

export default function MoodWheel({ mood, score }: MoodWheelProps) {
    const chartData = [
        { name: mood, value: score, fill: MOOD_COLORS_HSL[mood] },
        { name: "Remaining", value: 1 - score, fill: "hsl(var(--muted) / 0.3)" },
    ]

    const chartConfig = {
      score: {
        label: "Score",
      },
      [mood]: {
        label: mood,
      },
    } satisfies ChartConfig

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-full max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
          startAngle={90}
          endAngle={450}
        >
            {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
        </Pie>
         <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-2xl font-bold font-headline"
            style={{ fill: MOOD_COLORS_HSL[mood] }}
        >
            {mood}
        </text>
         <text
            x="50%"
            y="50%"
            dy="1.5em"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-sm"
        >
            {`${Math.round(score * 100)}% Match`}
        </text>
      </PieChart>
    </ChartContainer>
  )
}
