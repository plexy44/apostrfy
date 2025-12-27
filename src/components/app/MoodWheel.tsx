/**
 * @fileoverview This component renders a radial chart (a "mood wheel") to visualize
 * the primary emotion and confidence score from the sentiment analysis. It uses Recharts
 * to create the pie chart and dynamically styles it based on the detected emotion.
 */
"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"
import type { Emotion } from "@/lib/types";
import type { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { motion } from "framer-motion";

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

const CustomTooltipContent = (props: TooltipProps<ValueType, NameType>) => {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    const data = payload[0];
    if (data.name !== 'Remaining' && data.value) {
        return (
          <div className="p-2 text-sm bg-background/80 backdrop-blur-sm rounded-md border border-border/20 shadow-lg">
            <p className="font-bold" style={{ color: data.payload.fill }}>{`${data.name}`}</p>
            <p className="text-foreground">{`Match: ${Math.round(Number(data.value) * 100)}%`}</p>
          </div>
        );
    }
  }
  return null;
};


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
      <motion.div className="w-full h-full rounded-full mood-shimmer">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<CustomTooltipContent />}
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
              className="fill-foreground text-xl font-bold font-headline"
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
      </motion.div>
    </ChartContainer>
  )
}
