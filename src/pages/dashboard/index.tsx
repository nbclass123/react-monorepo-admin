import {
  ArrowUpOutlined,
  FileTextOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Button, Card, Col, Row, Skeleton, Table } from "antd";
import { useEffect, useRef, useState } from "react";

import { getUserList } from "@/api/module/user";
import BarChart from "@/components/charts/BarChart";
import LineChart from "@/components/charts/LineChart";
import MiniBarChart from "@/components/charts/MiniBarChart";
import MiniDonut from "@/components/charts/MiniDonut";
import MonthlyTrendChart from "@/components/charts/MonthlyTrendChart";
import PieChart from "@/components/charts/PieChart";

import "./index.scss";
import {
  barChartData,
  buildStatCards,
  monthlyGrowth,
  multiLineChartData,
  orderColumns,
  pieChartData,
  quickStats,
  recentOrders
} from "./mockData";

const DashboardPage = () => {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMultiDimensional, setShowMultiDimensional] = useState(true);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    getUserList({ page: 1, size: 10 })
      .then((res) => setTotalUsers(res.data.total))
      .finally(() => setLoading(false));
  }, []);

  const statCards = buildStatCards(totalUsers ?? 0);

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
      <div className="dashboard-bg-shapes">
        <div className="dashboard-bg-shape bg-shape-1" />
        <div className="dashboard-bg-shape bg-shape-2" />
        <div className="dashboard-bg-shape bg-shape-3" />
      </div>

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
                {stat.trendText && (
                  <span
                    style={{ color: "var(--md-text-secondary)", fontWeight: 400, marginLeft: 4 }}
                  >
                    vs {stat.trendText}
                  </span>
                )}
              </div>
              {stat.chartData ? (
                <MiniBarChart data={stat.chartData} color={stat.color} />
              ) : stat.donutPct !== undefined ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
                  <MiniDonut pct={stat.donutPct} color={stat.color} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 12, color: "var(--md-text-secondary)", marginBottom: 4 }}
                    >
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
                  <ArrowUpOutlined />
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
                { icon: <TeamOutlined />, label: "团队设置", color: "#EC4899" }
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
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
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
              rowKey="id"
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
