import React, { useState } from "react";
import {
  HistoryOutlined,
  StockOutlined,
  SettingOutlined,
  HomeOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  let location = useLocation();

  const [current] = useState(
    location.pathname === "/" || location.pathname === ""
      ? "/admin-live"
      : location.pathname
  );

  return (
    <>
      <Sider
        width={200}
        style={{
          height: "100%",
        }}
      >
        <Menu
          mode='inline'
          selectedKeys={[current]}
          style={{
            height: "90vh",
            borderRight: 0,
          }}
          onClick={({ key }) => {
            navigate(key);
          }}
          items={[
            {
              label: "Live",
              icon: <StockOutlined />,
              key: "/admin-live",
            },
            {
              label: "History",
              icon: <HistoryOutlined />,
              key: "/admin-history",
            },
            {
              label: "Settings",
              icon: <SettingOutlined />,
              key: "/admin-settings",
            },
            {
              label: "Users",
              icon: <UserOutlined />,
              key: "/admin-users",
            },
            {
              label: "Account Detail",
              icon: <SettingOutlined />,
              key: "/admin-accountdetails",
            },
            {
              label: "Reset-Password",
              icon: <LockOutlined />,
              key: "/reset-password",
              
            },
            {
              label: "Home",
              icon: <HomeOutlined/>,
              key: "/",
              
            },
          ]}
        ></Menu>
      </Sider>
    </>
  );
};

export default Sidebar;
