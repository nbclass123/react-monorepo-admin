import { useEffect, useState } from "react";
import { Card, Col, Row, Skeleton, Table, Button } from "antd";
import {
  TeamOutlined,
  UserAddOutlined,
  SmileOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  DollarOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { getUserList } from "@/api/module/user";
import LineChart from "@/components/charts/LineChart";
import PieChart from "@/components/charts/PieChart";
import BarChart from "@/components/charts/BarChart";
import "./index.css";

// 迷你柱状图组件
const MiniBarChart = ({ data, color }: { data: number[]; color: string }) => {
  const maxValue = Math.max(...data);
  
  return (
    <div className="stat-card-chart">
      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "60px" }}>
        {data.map((v, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${(v / maxValue) * 100}%`,
              background: `linear-gradient(to top, ${color}, ${color}88)`,
              borderRadius: "4px 4px 0 0",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              minWidth: "6px",
            }}
          />
        ))}
      </div>
    </div>
  );
};

// 迷你环形图组件
const MiniDonut = ({ pct, color }: { pct: number; color: string }) => (
  <div
    style={{
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      background: `conic-gradient(${color} 0deg, ${color} ${pct * 3.6}deg, var(--md-border-subtle) ${pct * 3.6}deg, var(--md-border-subtle) 360deg)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    }}
  >
    <div
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "var(--md-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontSize: "12px",
          fontWeight: "800",
          color,
        }}
      >
        {pct}%
      </span>
    </div>
  </div>
);

// 月度增长趋势图组件
const MonthlyTrendChart = ({ data }: { data: number[] }) => {
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const maxValue = Math.max(...data);
  
  return (
    <div className="monthly-trend-container">
      <div className="trend-summary">
        <div className="summary-item">
          <span className="summary-label">总增长</span>
          <span className="summary-value">{data.reduce((a, b) => a + b, 0)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">最高月</span>
          <span className="summary-value">{months[data.indexOf(maxValue)]}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">平均值</span>
          <span className="summary-value">{Math.round(data.reduce((a, b) => a + b, 0) / data.length)}</span>
        </div>
      </div>
      
      <div className="trend-chart-area">
        <div className="trend-y-axis">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>0</span>
        </div>
        
        <div className="trend-bars-container">
          {data.map((value, i) => {
            const height = (value / maxValue) * 100;
            const isMax = value === maxValue;
            return (
              <div key={i} className="trend-bar-wrapper">
                <div 
                  className={`trend-bar ${isMax ? 'max-bar' : ''}`}
                  style={{
                    height: `${height}%`,
                    background: isMax 
                      ? 'linear-gradient(180deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%)'
                      : 'linear-gradient(180deg, var(--md-primary-light) 0%, var(--md-primary) 100%)',
                  }}
                >
                  <span className="bar-value">{value}</span>
                </div>
                <span className="trend-label">{months[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMultiDimensional, setShowMultiDimensional] = useState(true);

  useEffect(() => {
    getUserList({ page: 1, size: 10 })
      .then((res) => setTotalUsers(res.data.total))
      .finally(() => setLoading(false));
  }, []);

  const weeklyVisits = [12, 19, 15, 25, 22, 30, 28];
  const monthlyGrowth = [8, 12, 15, 22, 18, 28, 25, 32, 29, 38, 34, 42];

  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  
  const multiLineData = [
    {
      name: "访问量",
      color: "#6366F1",
      data: [1200, 1350, 1100, 1480, 1620, 1890, 2100, 1950, 2200, 2450, 2300, 2680],
    },
    {
      name: "用户数",
      color: "#10B981",
      data: [800, 950, 880, 1050, 1200, 1350, 1500, 1450, 1600, 1780, 1700, 1920],
    },
    {
      name: "订单数",
      color: "#F59E0B",
      data: [450, 520, 480, 600, 720, 850, 980, 900, 1050, 1180, 1100, 1280],
    },
    {
      name: "转化率",
      color: "#EC4899",
      data: [150, 180, 160, 200, 220, 260, 290, 270, 310, 340, 320, 380],
    },
  ];

  const multiLineChartData = multiLineData.map((item) => ({
    name: item.name,
    color: item.color,
    data: months.map((month, index) => ({ month, value: item.data[index] })),
  }));

  const pieChartData = [
    { name: "管理员", value: 120 },
    { name: "普通用户", value: 2356 },
    { name: "VIP用户", value: 528 },
    { name: "企业用户", value: 189 },
    { name: "测试用户", value: 45 },
  ];

  const barChartData = [
    { name: "产品A", value: 3200 },
    { name: "产品B", value: 2850 },
    { name: "产品C", value: 4100 },
    { name: "产品D", value: 1890 },
    { name: "产品E", value: 2560 },
    { name: "产品F", value: 3780 },
  ];

  const recentOrders = [
    { id: "ORD001", customer: "张三", amount: 299.00, status: "已完成", date: "2024-01-15" },
    { id: "ORD002", customer: "李四", amount: 599.00, status: "处理中", date: "2024-01-15" },
    { id: "ORD003", customer: "王五", amount: 129.00, status: "待支付", date: "2024-01-14" },
    { id: "ORD004", customer: "赵六", amount: 899.00, status: "已完成", date: "2024-01-14" },
    { id: "ORD005", customer: "钱七", amount: 356.00, status: "已发货", date: "2024-01-13" },
  ];

  const orderColumns = [
    { title: "订单号", dataIndex: "id", key: "id" },
    { title: "客户", dataIndex: "customer", key: "customer" },
    { title: "金额", dataIndex: "amount", key: "amount", render: (v: number) => `¥${v.toFixed(2)}` },
    { title: "状态", dataIndex: "status", key: "status" },
    { title: "日期", dataIndex: "date", key: "date" },
  ];

  const quickStats = [
    { icon: <ArrowUpOutlined />, label: "转化率", value: "23.5%", change: "+2.3%", color: "#10B981", trend: "up" },
    { icon: <DollarOutlined />, label: "平均客单价", value: "¥356", change: "+12%", color: "#6366F1", trend: "up" },
    { icon: <EyeOutlined />, label: "页面浏览量", value: "12.5K", change: "+8.5%", color: "#F59E0B", trend: "up" },
    { icon: <CalendarOutlined />, label: "活跃天数", value: "28天", change: "+5天", color: "#EC4899", trend: "up" },
  ];

  const statCards = [
    {
      title: "用户总数",
      value: totalUsers ?? 0,
      icon: <TeamOutlined />,
      color: "#6366F1",
      trend: "+18%",
      trendColor: "#10B981",
      chartData: weeklyVisits,
    },
    {
      title: "今日新增",
      value: 128,
      icon: <UserAddOutlined />,
      color: "#10B981",
      trend: "+12%",
      trendColor: "#10B981",
      donutPct: 68,
      trendText: "较昨日",
    },
    {
      title: "活跃用户",
      value: 856,
      icon: <SmileOutlined />,
      color: "#F59E0B",
      trend: "+5%",
      trendColor: "#F59E0B",
      donutPct: 73,
      trendText: "周同比",
    },
    {
      title: "订单数",
      value: 2563,
      icon: <ShoppingCartOutlined />,
      color: "#EC4899",
      trend: "+18%",
      trendColor: "#EC4899",
      donutPct: 42,
      trendText: "月同比",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <Skeleton.Avatar size={56} shape="square" />
            <Skeleton active paragraph={{ rows: 2 }} style={{ width: 200 }} />
          </div>
        </div>

        <Row gutter={[16, 16]} className="stats-row">
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card className="stat-card">
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]} className="quick-stats-row">
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={6} key={i}>
              <Card className="quick-stat-card">
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* 背景浮动形状 */}
      <div className="dashboard-bg-shapes">
        <div className="dashboard-bg-shape bg-shape-1" />
        <div className="dashboard-bg-shape bg-shape-2" />
        <div className="dashboard-bg-shape bg-shape-3" />
      </div>

      {/* 页面头部 */}
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <div className="dashboard-avatar">
            <UserOutlined />
          </div>
          <div className="dashboard-title-section">
            <h1>欢迎回来！</h1>
            <p>这是您的数据仪表盘，包含最新的业务概览</p>
          </div>
        </div>
      </div>

      {/* 主要统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="stat-card">
              <div className="stat-card-header">
                <div>
                  <div className="stat-card-title">{stat.title}</div>
                  <div className="stat-card-value">{stat.value}</div>
                </div>
                <div
                  className="stat-card-icon"
                  style={{ background: `${stat.color}15`, color: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="stat-card-trend" style={{ color: stat.trendColor }}>
                <ArrowUpOutlined />
                <span>{stat.trend}</span>
                {stat.trendText && <span style={{ color: "var(--md-text-secondary)", fontWeight: 400, marginLeft: 4 }}>
                  vs {stat.trendText}
                </span>}
              </div>
              {stat.chartData ? (
                <MiniBarChart data={stat.chartData} color={stat.color} />
              ) : stat.donutPct !== undefined ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
                  <MiniDonut pct={stat.donutPct} color={stat.color} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "var(--md-text-secondary)", marginBottom: 4 }}>
                      {stat.trendText}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: stat.trendColor }}>
                      {stat.trend}
                    </div>
                  </div>
                </div>
              ) : null}
            </Card>
          </Col>
        ))}
      </Row>

      {/* 快速统计卡片 */}
      <Row gutter={[16, 16]} className="quick-stats-row">
        {quickStats.map((item, index) => (
          <Col xs={24} sm={6} key={index}>
            <Card className="quick-stat-card">
              <div
                className="quick-stat-icon"
                style={{ background: `${item.color}15`, color: item.color }}
              >
                {item.icon}
              </div>
              <div className="quick-stat-content">
                <div className="quick-stat-label">{item.label}</div>
                <div className="quick-stat-value">{item.value}</div>
                <div className="quick-stat-change" style={{ color: item.color }}>
                  {item.trend === "up" ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  <span>{item.change}</span>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} lg={8}>
          <Card title="用户分类统计" className="chart-card">
            <PieChart data={pieChartData} height={250} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="产品销售对比" className="chart-card">
            <BarChart data={barChartData} height={250} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="快速入口" className="chart-card">
            <div className="quick-entry">
              {[
                { icon: <FileTextOutlined />, label: "用户管理", color: "#6366F1" },
                { icon: <RiseOutlined />, label: "数据报表", color: "#10B981" },
                { icon: <ShoppingCartOutlined />, label: "订单列表", color: "#F59E0B" },
                { icon: <TeamOutlined />, label: "团队设置", color: "#EC4899" },
              ].map((item, i) => (
                <div key={i} className="quick-entry-item">
                  <div className="quick-entry-icon" style={{ color: item.color }}>
                    {item.icon}
                  </div>
                  <div className="quick-entry-label">{item.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 主图表 */}
      <Row gutter={[16, 16]} className="main-chart-row">
        <Col xs={24}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{showMultiDimensional ? "多维度数据趋势" : "访问量趋势"}</span>
                <Button 
                  type="text" 
                  size="small"
                  onClick={() => setShowMultiDimensional(!showMultiDimensional)}
                >
                  {showMultiDimensional ? "单一维度" : "多维度"}
                </Button>
              </div>
            }
            className="main-chart-card"
          >
            <LineChart 
              multiData={showMultiDimensional ? multiLineChartData : undefined}
              data={!showMultiDimensional ? multiLineChartData[0].data : undefined}
              height={320} 
            />
          </Card>
        </Col>
      </Row>

      {/* 底部区域 */}
      <Row gutter={[16, 16]} className="bottom-row">
        <Col xs={24} lg={12}>
          <Card title="月度增长趋势" className="bottom-card">
            <MonthlyTrendChart data={monthlyGrowth} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近订单" className="bottom-card">
            <Table
              className="orders-table"
              dataSource={recentOrders}
              columns={orderColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
