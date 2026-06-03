import {
  AppstoreOutlined,
  BookOutlined,
  CloudUploadOutlined,
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
  UserOutlined,
  VideoCameraOutlined
} from "@ant-design/icons";
import { Avatar, Breadcrumb, Button, Dropdown, Layout, Menu, Space, Tooltip } from "antd";
import useApp from "antd/es/app/useApp";
import { useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/useAuth";
import SvgIcon from "@/components/SvgIcon";
import { useLayout } from "@/hooks/useLayout";
import { useTheme } from "@/theme/index";

import "./index.scss";

const { Sider, Header, Content } = Layout;

/** 顶部右侧操作区：布局切换、主题切换、用户下拉 */
function HeaderRight({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate();
  const { userInfo, logoutAction } = useAuth();
  const { mode, toggleMode } = useTheme();
  const { layout, toggleLayout } = useLayout();
  const loggingOutRef = useRef(false);
  const { modal } = useApp();

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
    { type: "divider" as const },
    {
      key: "profile",
      icon: <IdcardOutlined />,
      label: "个人中心",
      onClick: () => navigate("/userProfile")
    },
    { key: "logout", icon: <LogoutOutlined />, label: "退出登录", onClick: handleLogout }
  ];

  const isSideLayout = layout === "side";

  return (
    <div className="vercel-header-right">
      <Tooltip title={isSideLayout ? "切换到顶部菜单布局" : "切换到侧边栏布局"}>
        <Button
          type="text"
          icon={isSideLayout ? <AppstoreOutlined /> : <MenuFoldOutlined />}
          onClick={toggleLayout}
          className="vercel-layout-btn"
        />
      </Tooltip>
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
            <SvgIcon name="fanqie" />
          )}
          {!collapsed && (
            <span className="vercel-username">
              {userInfo?.username || userInfo?.nickname || "用户"}
            </span>
          )}
        </Space>
      </Dropdown>
    </div>
  );
}

/** 面包屑导航 */
function BreadcrumbNav({
  menuItems,
  currentPath
}: {
  menuItems: Array<{
    key: string;
    label: string;
    children?: Array<{ key: string; label: string }>;
  }>;
  currentPath: string;
}) {
  const navigate = useNavigate();

  const getBreadcrumbItems = () => {
    const items: Array<{ key: string; label: string; path: string }> = [
      { key: "dashboard", label: "仪表盘", path: "/dashboard" }
    ];

    const findPath = (
      list: typeof menuItems,
      targetPath: string,
      parents: Array<{ key: string; label: string; path: string }> = []
    ): boolean => {
      for (const menu of list) {
        if (menu.key === targetPath) {
          items.push(...parents, { key: menu.key, label: menu.label, path: "" });
          return true;
        }
        if (menu.children) {
          if (
            findPath(menu.children, targetPath, [
              ...parents,
              { key: menu.key, label: menu.label, path: menu.children?.[0]?.key || menu.key }
            ])
          ) {
            return true;
          }
        }
      }
      return false;
    };

    if (currentPath !== "/dashboard") {
      findPath(menuItems, currentPath);
    }
    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <div className="vercel-breadcrumb-wrapper">
      <Breadcrumb
        items={breadcrumbItems.map((item) => ({
          title: item.path ? <a onClick={() => navigate(item.path)}>{item.label}</a> : item.label
        }))}
      />
    </div>
  );
}

const menuItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "仪表盘" },
  { key: "/svgIcon", icon: <RocketOutlined />, label: "图标图鉴" },
  { key: "/userList", icon: <TeamOutlined />, label: "用户管理" },
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
  },
  {
    key: "/uploadTest",
    icon: <CloudUploadOutlined />,
    label: "上传测试"
  },
  {
    key: "recording",
    icon: <VideoCameraOutlined />,
    label: "会话录制",
    children: [
      { key: "/recording/manage", label: "录制管理" },
      { key: "/recording/playback", label: "视频回放" }
    ]
  }
];

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>(["blog", "sysAuth", "recording"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { layout } = useLayout();

  const currentPath = location.pathname;

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const sharedBreadcrumb = <BreadcrumbNav menuItems={menuItems} currentPath={currentPath} />;

  const sharedContent = (
    <>
      {sharedBreadcrumb}
      <Content className="vercel-content">
        <Outlet />
      </Content>
    </>
  );

  if (layout === "top") {
    return (
      <Layout className="main-layout top-layout">
        <Header className="vercel-header top-header">
          <div className="vercel-header-content">
            <div className="vercel-header-left">
              <div className="vercel-brand">
                <span className="vercel-brand-text">呼呼呼</span>
              </div>
            </div>
            <div className="vercel-header-center">
              <Menu
                mode="horizontal"
                selectedKeys={[currentPath]}
                items={menuItems}
                onClick={handleMenuClick}
                className="vercel-top-menu"
              />
            </div>
            <HeaderRight collapsed={false} />
          </div>
        </Header>
        <Layout className="main-layout-inner">{sharedContent}</Layout>
      </Layout>
    );
  }

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
          inlineCollapsed={collapsed}
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
            <HeaderRight collapsed={collapsed} />
          </div>
        </Header>
        {sharedContent}
      </Layout>
    </Layout>
  );
};

export default MainLayout;
