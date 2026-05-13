import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Skeleton } from "antd";
import {
  TeamOutlined,
  UserAddOutlined,
  SmileOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import PageHeader from "@/components/PageHeader/index";
import { getUserList } from "@/api/module/user";

const MiniBarChart = ({ data, color }: { data: number[]; color: string }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-end",
      gap: "3px",
      height: "48px",
      paddingTop: "4px",
    }}>
    {data.map((v, i) => (
      <div
        key={i}
        style={{
          flex: 1,
          height: `${Math.max(v * 3.5, 4)}px`,
          background: color,
          borderRadius: "3px 3px 2px 2px",
          transition: "height 0.3s ease",
          minWidth: "4px",
        }}
      />
    ))}
  </div>
);

const MiniDonut = ({ pct, color }: { pct: number; color: string }) => (
  <div
    style={{
      width: 52,
      height: 52,
      borderRadius: "50%",
      background: `conic-gradient(${color} 0deg, ${color} ${pct * 3.6}deg, var(--md-surface-variant) ${pct * 3.6}deg, var(--md-surface-variant) 360deg)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      fontWeight: 700,
      color: "var(--md-text-primary)",
    }}>
    {pct}%
  </div>
);

const DashboardPage = () => {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserList({ page: 1, size: 10 })
      .then((res) => setTotalUsers(res.data.total))
      .finally(() => setLoading(false));
  }, []);

  const weeklyVisits = [3, 7, 5, 10, 8, 12, 15];
  const monthlyGrowth = [2, 4, 3, 6, 5, 8, 7, 9, 6, 10, 8, 12];

  if (loading) {
    return (
      <div>
        <PageHeader title="仪表盘" subtitle="数据概览" />
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="仪表盘" subtitle="数据概览" />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="用户总数"
              value={totalUsers ?? 0}
              prefix={<TeamOutlined />}
            />
            <MiniBarChart data={weeklyVisits} color="var(--md-primary)" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="今日新增"
              value={128}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: "#10B981" }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
              }}>
              <MiniDonut pct={68} color="#10B981" />
              <span style={{ fontSize: 12, color: "var(--md-text-secondary)" }}>
                较昨日{" "}
                <span style={{ color: "#10B981", fontWeight: 600 }}>
                  +12%
                </span>
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="活跃用户"
              value={856}
              prefix={<SmileOutlined />}
              valueStyle={{ color: "#F59E0B" }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
              }}>
              <MiniDonut pct={73} color="#F59E0B" />
              <span style={{ fontSize: 12, color: "var(--md-text-secondary)" }}>
                周同比{" "}
                <span style={{ color: "#F59E0B", fontWeight: 600 }}>+5%</span>
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="订单数"
              value={2563}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#EC4899" }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
              }}>
              <MiniDonut pct={42} color="#EC4899" />
              <span style={{ fontSize: 12, color: "var(--md-text-secondary)" }}>
                月同比{" "}
                <span style={{ color: "#EC4899", fontWeight: 600 }}>
                  +18%
                </span>
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="月度增长趋势" bordered={false}>
            <MiniBarChart data={monthlyGrowth} color="var(--md-primary)" />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                fontSize: 11,
                color: "var(--md-text-secondary)",
              }}>
              {["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="快速入口" bordered={false}>
            <Row gutter={[8, 8]}>
              {[
                { icon: <FileTextOutlined />, label: "用户管理", color: "#6366F1" },
                { icon: <RiseOutlined />, label: "数据报表", color: "#10B981" },
                { icon: <ShoppingCartOutlined />, label: "订单列表", color: "#F59E0B" },
                { icon: <TeamOutlined />, label: "团队设置", color: "#EC4899" },
              ].map((item, i) => (
                <Col span={12} key={i}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "16px 8px",
                      background: "var(--md-surface-variant)",
                      borderRadius: "var(--md-radius-md)",
                      cursor: "pointer",
                      transition: "all var(--md-transition)",
                    }}>
                    <div
                      style={{
                        fontSize: 22,
                        color: item.color,
                        marginBottom: 6,
                      }}>
                      {item.icon}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--md-text-secondary)",
                      }}>
                      {item.label}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
