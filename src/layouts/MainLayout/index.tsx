import {
  BookOutlined,
  DashboardOutlined,
  IdcardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  SunOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Layout, Menu, Space } from "antd";
import useApp from "antd/es/app/useApp";
import { useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import SvgIcon from "@/components/SvgIcon";
import { useAuth } from "@/store/useAuth";
import { useTheme } from "@/theme/index";

import "./index.css";

const { Sider, Header, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>(["blog", "sysAuth"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logoutAction } = useAuth();
  const { mode, toggleMode } = useTheme();
  const loggingOutRef = useRef(false);
  const { modal } = useApp();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "仪表盘"
    },
    {
      key: "/svg-icon",
      icon: <RocketOutlined />,
      label: "图标图鉴"
    },
    {
      key: "/userList",
      icon: <TeamOutlined />,
      label: "用户管理"
    },
    {
      key: "blog",
      icon: <BookOutlined />,
      label: "博客管理",
      children: [
        { key: "/blog/category", label: "文章分类" },
        { key: "/blog/tag", label: "文章标签" },
        { key: "/blog/post", label: "文章管理" }
      ]
    },
    {
      key: "sysAuth",
      icon: <SafetyCertificateOutlined />,
      label: "权限管理",
      children: [
        { key: "/sys/role", label: "角色管理" },
        { key: "/sys/permission", label: "权限管理" }
      ]
    }
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    if (loggingOutRef.current) return;
    modal.confirm({
      title: "退出登录",
      icon: <LogoutOutlined />,
      content: (
        <div style={{ paddingTop: 8 }}>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: "#6b7280" }}>用户名：</span>
            <span style={{ fontWeight: 500 }}>{userInfo?.username ?? "-"}</span>
          </div>
          <div>
            <span style={{ color: "#6b7280" }}>邮箱：</span>
            <span style={{ fontWeight: 500 }}>{userInfo?.email ?? "-"}</span>
          </div>
        </div>
      ),
      okText: "确认退出",
      okType: "danger",
      cancelText: "取消",
      centered: true,
      onOk: async () => {
        loggingOutRef.current = true;
        await logoutAction();
        navigate("/login", { replace: true });
        loggingOutRef.current = false;
      }
    });
  };

  const currentPath = location.pathname;

  const userMenuItems = [
    {
      key: "userInfo",
      label: (
        <div style={{ padding: "4px 0" }}>
          <div style={{ fontWeight: 600, lineHeight: "22px" }}>
            {userInfo?.nickname || userInfo?.username || "用户"}
          </div>
          <div style={{ fontSize: 12, color: "var(--md-text-secondary)", lineHeight: "18px" }}>
            {userInfo?.email || ""}
          </div>
        </div>
      ),
      disabled: true
    },
    {
      type: "divider" as const
    },
    {
      key: "profile",
      icon: <IdcardOutlined />,
      label: "个人中心",
      onClick: () => navigate("/userProfile")
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: handleLogout
    }
  ];

  return (
    <Layout className="main-layout">
      <Sider collapsible collapsed={collapsed} trigger={null} width={240} className="vercel-sider">
        <div className="vercel-brand">
          {collapsed ? (
            <span className="vercel-brand-icon">呼</span>
          ) : (
            <span className="vercel-brand-text">呼呼呼</span>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentPath]}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={setOpenKeys}
          items={menuItems}
          onClick={handleMenuClick}
          className="vercel-menu"
        />
      </Sider>
      <Layout className="main-layout-inner">
        <Header className="vercel-header">
          <div className="vercel-header-content">
            <div className="vercel-header-left">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="vercel-collapse-btn"
              />
            </div>
            <div className="vercel-header-right">
              <Button
                type="text"
                icon={mode === "dark" ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleMode}
                className="vercel-theme-btn"
              />
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Space className="vercel-user-dropdown">
                  {userInfo?.avatarUrl ? (
                    <Avatar size={32} src={userInfo?.avatarUrl} icon={<UserOutlined />} />
                  ) : (
                    <SvgIcon name="xihonhshi" />
                  )}
                  {!collapsed && (
                    <span className="vercel-username">
                      {userInfo?.username || userInfo?.nickname || "用户"}
                    </span>
                  )}
                </Space>
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content className="vercel-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
