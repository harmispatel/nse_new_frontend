import { Form, Input, Button, message } from "antd";
import { Layout,  Breadcrumb } from "antd";
import Sidebar from "./Sidebar";
import axios from "axios";
import { useState } from "react";
import { LOCAL_BASE_URL } from "../api/LocalApi";
const { Header } = Layout;

const ChangePasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const onFinish = async (values) => {
    try {
      const article = {
        old_password: values.oldPassword,
        new_password: values.newPassword,
        confirm_password: values.confirmPassword,
      };
      setLoading(true)
      await axios({
        method: "put",
        url: LOCAL_BASE_URL + "/change-password/",
        data: article,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + localStorage.getItem("token"),
        },
      }).then((response) => {
        messageApi.open({
          type: "success",
          content: "Successfully Update Password",
        });
        setLoading(false)
      });
    } catch (err) {
      console.log('errrr',err);
      messageApi.open({
        type: "error",
        content: " Old Password Incorrent",
      });
      setLoading(false)
    }
  };

  return (
    <>
      {contextHolder}
      <Layout>
        <Header className="head-main">
          <div className="logo" />
        </Header>

        <Layout>
          <Sidebar />

          <Layout className="site-layout-background" style={{ margin: "24px 16px 0" }} >
            <Breadcrumb style={{ margin: "16px 30px" }}>
              <Breadcrumb.Item>Admin</Breadcrumb.Item>
              <Breadcrumb.Item>Reset Password</Breadcrumb.Item>
            </Breadcrumb>
            <div className="container">
              <div className="login-form" style={{ marginTop: "90px" }}>
                <Form
                  name="basic"
                  labelCol={{ span: 800 }}
                  wrapperCol={{ span: 20 }}
                  initialValues={{ remember: true }}
                  onFinish={onFinish}
                 
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
                    size="small"
                    name="oldPassword"
                    label="Old Password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your old password!",
                      },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                  <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your new password!",
                      },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    rules={[
                      {
                        required: true,
                        message: "Please confirm your new password!",
                      },
                      ({ getFieldValue }) => ({
                        validator(rule, value) {
                          if (
                            !value ||
                            getFieldValue("newPassword") === value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            "The two passwords that you entered do not match!"
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                  <Form.Item
                   wrapperCol={{
                    offset: 8,
                    span: 16,
                  }}>
                    <Button loading={loading} type="primary" htmlType="submit">
                      Change Password
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </Layout>
        </Layout>
      </Layout>
    </>
  );
};
export default ChangePasswordForm;
