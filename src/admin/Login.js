import React from "react";
import { Button, Form, Input, message } from "antd";
import AuthService from "../services/AuthService";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  // const token = localStorage.getItem("token");
  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Login";
  });
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  
  const onChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };
  
  const onFinish = () => {
    setLoading(true)
    localStorage.removeItem("token")
    AuthService.login(loginData)
    .then((response) => {
      setLoading(false)
      localStorage.setItem("token", response.data.token);
      navigate("/");
    }).catch((err) => {
      messageApi.open({
        type: "error",
        content: "Unable to log in with provided credentials",
      });
        setLoading(false)
      }
    );
 
  };

  return (
    <>
      {contextHolder}

      <div className="container">
        <div className="login-form" style={{ height: "100vh" }}>
          <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
            style={{
              height: "100%",
              display: "flex",
              width: "100%",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Form.Item
              label="Username"
              name="username"
              onChange={onChange}
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                },
              ]}
            >
              <Input name="username" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              onChange={onChange}
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password name="password" />
            </Form.Item>


            <Form.Item
              wrapperCol={{
                offset: 8,
                span: 16,
              }}
            >
              <Button className="login-btn" loading={loading} type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Login;
