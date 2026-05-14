import * as echarts from "echarts";
import { useEffect, useRef } from "react";

interface BarChartProps {
  data: { name: string; value: number }[];
  height?: number;
}

export default function BarChart({ data, height = 280 }: BarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: "axis",
        backgroundColor: "var(--md-surface)",
        borderColor: "var(--md-border-color)",
        borderWidth: 1,
        textStyle: {
          color: "var(--md-text-primary)"
        },
        axisPointer: {
          type: "shadow"
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "10%",
        containLabel: true
      },
      xAxis: {
        type: "category",
        data: data.map((item) => item.name),
        axisLine: {
          lineStyle: {
            color: "var(--md-border-color)"
          }
        },
        axisLabel: {
          color: "var(--md-text-secondary)"
        }
      },
      yAxis: {
        type: "value",
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: "var(--md-border-subtle)"
          }
        },
        axisLabel: {
          color: "var(--md-text-secondary)"
        }
      },
      series: [
        {
          type: "bar",
          data: data.map((item, index) => ({
            value: item.value,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: index % 2 === 0 ? "#6366F1" : "#EC4899" },
                { offset: 1, color: index % 2 === 0 ? "#818CF8" : "#F472B6" }
              ]),
              borderRadius: [4, 4, 0, 0]
            }
          })),
          barWidth: "60%"
        }
      ]
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [data, height]);

  return <div ref={chartRef} style={{ height }} />;
}
