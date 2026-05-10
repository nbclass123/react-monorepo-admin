import { useState } from "react";
import { Layout, Menu, Button, Typography } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/index";
import "./index.css";

const { Sider, Header, Content } = Layout;

const menuItems = [
  {
    key: "/userList",
    icon: <TeamOutlined />,
    label: "用户管理",
  },
];

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logoutAction } = useAuth();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logoutAction();
    navigate("/login");
  };

  return (
    <Layout className="main-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        className="sider-frost"
        width={220}
      >
        <div className="logo-area">
          {collapsed ? "RA" : "React App"}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout className="main-layout-inner">
        <Header className="header-frost">
          <div className="header-content">
            <div className="header-left">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
            </div>
            <div className="header-right">
              <UserOutlined />
              <Typography.Text>{userInfo?.username ?? "用户"}</Typography.Text>
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              />
            </div>
          </div>
        </Header>
        <Content className="content-area">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
