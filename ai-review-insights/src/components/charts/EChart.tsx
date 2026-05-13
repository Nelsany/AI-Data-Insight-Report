"use client";

import * as React from "react";
import * as echarts from "echarts";
import { cn } from "@/lib/utils";

export function EChart({
  option,
  className,
}: {
  option: echarts.EChartsOption;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<echarts.ECharts | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    chartRef.current = echarts.init(ref.current, undefined, { renderer: "canvas" });
    return () => {
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true });
  }, [option]);

  React.useEffect(() => {
    const onResize = () => chartRef.current?.resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return <div ref={ref} className={cn("h-64 w-full", className)} />;
}

