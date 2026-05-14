import { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface PieChartProps {
  data: { name: string; value: number }[];
  height?: number;
}

const colors = [
  "#6366F1",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
];

export default function PieChart({ data, height = 280 }: PieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: "item",
        backgroundColor: "var(--md-surface)",
        borderColor: "var(--md-border-color)",
        borderWidth: 1,
        textStyle: {
          color: "var(--md-text-primary)",
        },
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        right: "5%",
        top: "center",
        textStyle: {
          color: "var(--md-text-secondary)",
        },
      },
      series: [
        {
          name: "分类",
          type: "pie",
          radius: ["45%", "70%"],
          center: ["35%", "50%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: "var(--md-surface)",
            borderWidth: 2,
          },
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 18,
              fontWeight: "bold",
              color: "var(--md-text-primary)",
            },
          },
          labelLine: {
            show: false,
          },
          data: data.map((item, index) => ({
            ...item,
            itemStyle: {
              color: colors[index % colors.length],
            },
          })),
        },
      ],
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