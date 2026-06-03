import {
  ArrowUpOutlined,
  CalendarOutlined,
  DollarOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  SmileOutlined,
  TeamOutlined,
  UserAddOutlined
} from "@ant-design/icons";

/** 周访问量趋势数据 */
export const weeklyVisits = [12, 19, 15, 25, 22, 30, 28];

/** 月度增长数据 */
export const monthlyGrowth = [8, 12, 15, 22, 18, 28, 25, 32, 29, 38, 34, 42];

export const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

/** 多维度折线图原始数据 */
export const multiLineRawData = [
  { name: "访问量", color: "#6366F1", data: [1200, 1350, 1100, 1480, 1620, 1890, 2100, 1950, 2200, 2450, 2300, 2680] },
  { name: "用户数", color: "#10B981", data: [800, 950, 880, 1050, 1200, 1350, 1500, 1450, 1600, 1780, 1700, 1920] },
  { name: "订单数", color: "#F59E0B", data: [450, 520, 480, 600, 720, 850, 980, 900, 1050, 1180, 1100, 1280] },
  { name: "转化率", color: "#EC4899", data: [150, 180, 160, 200, 220, 260, 290, 270, 310, 340, 320, 380] }
];

/** 多维度折线图数据（转换为 LineChart 所需格式） */
export const multiLineChartData = multiLineRawData.map((item) => ({
  name: item.name,
  color: item.color,
  data: months.map((month, index) => ({ month, value: item.data[index] }))
}));

/** 饼图数据 */
export const pieChartData = [
  { name: "管理员", value: 120 },
  { name: "普通用户", value: 2356 },
  { name: "VIP用户", value: 528 },
  { name: "企业用户", value: 189 },
  { name: "测试用户", value: 45 }
];

/** 柱状图数据 */
export const barChartData = [
  { name: "产品A", value: 3200 },
  { name: "产品B", value: 2850 },
  { name: "产品C", value: 4100 },
  { name: "产品D", value: 1890 },
  { name: "产品E", value: 2560 },
  { name: "产品F", value: 3780 }
];

/** 最近订单数据 */
export const recentOrders = [
  { id: "ORD001", customer: "张三", amount: 299.0, status: "已完成", date: "2024-01-15" },
  { id: "ORD002", customer: "李四", amount: 599.0, status: "处理中", date: "2024-01-15" },
  { id: "ORD003", customer: "王五", amount: 129.0, status: "待支付", date: "2024-01-14" },
  { id: "ORD004", customer: "赵六", amount: 899.0, status: "已完成", date: "2024-01-14" },
  { id: "ORD005", customer: "钱七", amount: 356.0, status: "已发货", date: "2024-01-13" }
];

/** 订单表格列定义 */
export const orderColumns = [
  { title: "订单号", dataIndex: "id", key: "id" },
  { title: "客户", dataIndex: "customer", key: "customer" },
  { title: "金额", dataIndex: "amount", key: "amount", render: (v: number) => `¥${v.toFixed(2)}` },
  { title: "状态", dataIndex: "status", key: "status" },
  { title: "日期", dataIndex: "date", key: "date" }
];

/** 快速统计卡片数据 */
export const quickStats = [
  { icon: <ArrowUpOutlined />, label: "转化率", value: "23.5%", change: "+2.3%", color: "#10B981", trend: "up" as const },
  { icon: <DollarOutlined />, label: "平均客单价", value: "¥356", change: "+12%", color: "#6366F1", trend: "up" as const },
  { icon: <EyeOutlined />, label: "页面浏览量", value: "12.5K", change: "+8.5%", color: "#F59E0B", trend: "up" as const },
  { icon: <CalendarOutlined />, label: "活跃天数", value: "28天", change: "+5天", color: "#EC4899", trend: "up" as const }
];

/** 构建统计卡片数据（totalUsers 为动态值） */
export function buildStatCards(totalUsers: number) {
  return [
    { title: "用户总数", value: totalUsers ?? 0, icon: <TeamOutlined />, color: "#6366F1", trend: "+18%", trendColor: "#10B981", chartData: weeklyVisits },
    { title: "今日新增", value: 128, icon: <UserAddOutlined />, color: "#10B981", trend: "+12%", trendColor: "#10B981", donutPct: 68, trendText: "较昨日" },
    { title: "活跃用户", value: 856, icon: <SmileOutlined />, color: "#F59E0B", trend: "+5%", trendColor: "#F59E0B", donutPct: 73, trendText: "周同比" },
    { title: "订单数", value: 2563, icon: <ShoppingCartOutlined />, color: "#EC4899", trend: "+18%", trendColor: "#EC4899", donutPct: 42, trendText: "月同比" }
  ];
}
