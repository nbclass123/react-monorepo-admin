import * as echarts from "echarts";
import { useEffect, useRef } from "react";

interface LineChartProps {
  data?: { month: string; value: number }[];
  multiData?: { name: string; data: { month: string; value: number }[]; color: string }[];
  height?: number;
}

export default function LineChart({ data, multiData, height = 300 }: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const seriesData: any[] = multiData
      ? multiData.map((item) => ({
          name: item.name,
          type: "line" as const,
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          showSymbol: true,
          data: item.data.map((d) => d.value),
          lineStyle: {
            color: item.color,
            width: 4,
            shadowColor: `${item.color}40`,
            shadowBlur: 15,
            shadowOffsetY: 8
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${item.color}50` },
              { offset: 0.5, color: `${item.color}25` },
              { offset: 1, color: `${item.color}05` }
            ])
          },
          itemStyle: {
            color: item.color,
            borderColor: "#ffffff",
            borderWidth: 3,
            shadowColor: `${item.color}70`,
            shadowBlur: 8
          },
          emphasis: {
            itemStyle: {
              color: item.color,
              borderColor: "#ffffff",
              borderWidth: 4,
              shadowColor: `${item.color}90`,
              shadowBlur: 12
            },
            scale: true
          },
          animationDuration: 2000,
          animationEasing: "cubicOut"
        }))
      : [
          {
            name: "访问量",
            type: "line" as const,
            smooth: true,
            symbol: "circle",
            symbolSize: 8,
            showSymbol: true,
            data: data?.map((item) => item.value) || [],
            lineStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: "#6366F1" },
                { offset: 0.5, color: "#8B5CF6" },
                { offset: 1, color: "#A78BFA" }
              ]),
              width: 4,
              shadowColor: "rgba(99, 102, 241, 0.3)",
              shadowBlur: 15,
              shadowOffsetY: 8
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(99, 102, 241, 0.35)" },
                { offset: 0.5, color: "rgba(139, 92, 246, 0.2)" },
                { offset: 1, color: "rgba(99, 102, 241, 0.02)" }
              ])
            },
            itemStyle: {
              color: "#6366F1",
              borderColor: "#ffffff",
              borderWidth: 3,
              shadowColor: "rgba(99, 102, 241, 0.6)",
              shadowBlur: 8
            },
            emphasis: {
              itemStyle: {
                color: "#8B5CF6",
                borderColor: "#ffffff",
                borderWidth: 4,
                shadowColor: "rgba(139, 92, 246, 0.8)",
                shadowBlur: 12
              },
              scale: true
            },
            animationDuration: 2000,
            animationEasing: "cubicOut"
          }
        ];

    const months = multiData
      ? multiData[0]?.data.map((item) => item.month) || []
      : data?.map((item) => item.month) || [];

    const legendData = multiData ? multiData.map((item) => item.name) : ["访问量"];

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: "axis",
        backgroundColor: "var(--md-surface)",
        borderColor: "var(--md-primary)",
        borderWidth: 1,
        borderRadius: 8,
        textStyle: {
          color: "var(--md-text-primary)"
        },
        padding: [10, 15],
        axisPointer: {
          type: "cross",
          crossStyle: {
            color: "var(--md-primary-light)"
          }
        }
      },
      legend: {
        data: legendData,
        textStyle: {
          color: "var(--md-text-secondary)",
          fontWeight: 600
        },
        icon: "roundRect",
        itemWidth: 10,
        itemHeight: 4
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "15%",
        containLabel: true
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: months,
        axisLine: {
          lineStyle: {
            color: "var(--md-border-color)",
            width: 2
          }
        },
        axisLabel: {
          color: "var(--md-text-secondary)",
          fontWeight: 500
        },
        axisTick: {
          show: false
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
            color: "var(--md-border-subtle)",
            type: "dashed"
          }
        },
        axisLabel: {
          color: "var(--md-text-secondary)"
        }
      },
      series: seriesData,
      animation: true,
      animationDurationUpdate: 1500
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [data, multiData, height]);

  return <div ref={chartRef} style={{ height }} />;
}
