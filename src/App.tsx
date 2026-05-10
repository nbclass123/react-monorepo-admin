import type { FormProps } from "antd";
import { useState } from "react";
import { Button, Form, Input } from "antd";
import { login, getSysUserById } from "@/api/module/user";
import "./App.css";

type FieldType = {
  username: string;
  password: string;
};

const App: React.FC = () => {
  const [userInfo, setUserInfo] = useState({
    id: null,
    token: "",
  });

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    login(values).then((res) => {
      console.log(res.data);
      setUserInfo({
        id: res.data.id,
        token: res.data.token,
      });
      localStorage.setItem("token", res.data.token);
    });
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo,
  ) => {
    console.log("Failed:", errorInfo);
  };

  const onClickUserInfo = () => {
    getSysUserById(userInfo.id).then((res) => {
      console.log(res.data);
    });
  };

  return (
    <>
      <div className="login-container">
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off">
          <Form.Item<FieldType>
            label="Username"
            name="username"
            initialValue="匡一全"
            rules={[{ required: true, message: "请输入用户名" }]}>
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
            initialValue="123456789"
            rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              登录
            </Button>
          </Form.Item>
        </Form>
        <Button
          type="primary"
          disabled={userInfo.id == null}
          onClick={onClickUserInfo}>
          获取用户信息
        </Button>
      </div>
    </>
  );
};

export default App;
