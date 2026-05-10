import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/index";
import { login, type LoginVo } from "@/api/module/user";
import "./index.css";

type FieldType = {
  username: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAction } = useAuth();

  const onFinish = async (values: FieldType) => {
    try {
      const result: { code: number; message: string; data: LoginVo } =
        await login(values);
      await loginAction(result.data.token, result.data.id);
      message.success("登录成功");
      navigate("/userList", { replace: true });
    } catch (error: any) {
      message.warning("登录失败：" + error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>后台管理系统</h2>
        <p className="subtitle">欢迎，请登录您的账户</p>
        <Form onFinish={onFinish} autoComplete="off">
          <Form.Item<FieldType>
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item<FieldType>
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="login-form-button">
              登 录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
