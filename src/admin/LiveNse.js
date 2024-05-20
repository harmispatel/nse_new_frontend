import React from "react";
import { Layout, Table, Tag, Breadcrumb, Button, Switch, message } from "antd";
import NseService from "../services/NseService";
import { useEffect, useState } from "react";
import moment from "moment/moment";
import axios from "axios";
import { LOCAL_STOCK_API_URL, nse_api } from "../api/LocalApi";
import Sidebar from "./Sidebar";

const { Header } = Layout;
const { Content } = Layout;

const LiveNse = () => {

  const columns = [
    {
      title: "Id",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Strike Price",
      dataIndex: "base_strike_price",
      key: "base_strike_price",
    },
    {
      title: "Buy Price",
      dataIndex: "buy_price",
      key: "buy_price",
      render: (text, record) => {
        return <Tag color={"processing"}>{text}</Tag>;
      },
    },
    {
      title: "Target",
      dataIndex: "sell_price",
      key: "sell_price",
    },
    {
      title: "Stop Lose",
      dataIndex: "stop_loseprice",
      key: "stop_loseprice",
    },
    {
      title: "Buy Time",
      dataIndex: "buy_time",
      key: "buy_time",
      render: (text, record) => {
        return moment(text).format("DD/MM/YYYY HH:mm:ss");
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "Type",
      render: (text, record) => {
        return <Tag color={text === "BUY" ? "success" : "error"}>{text}</Tag>;
      },
    },
    {
      title: "Option",
      dataIndex: "percentage",
      key: "percentage",
      render: (text, record) => {
        if (text.option === 'STOCK CE' || text.option === 'STOCK PE' || text.option === 'STOCK FUTURE') {
          return record.stock_name;
          // if (text.option === 'BANKNIFTY FUTURE'){ 
          //   return record.type === 'BUY' ? text.option + ' BUY' : text.option + ' SELL'
          // }
        }
        return text.option;
      },
    },
    {
      title: "Operation",
      dataIndex: "operation",
      render: (_, record) => {
        return (
          <span>
            <Button
              type="primary"
              onClick={() => {
                getLocalData(record);
              }}
            >
              SELL
            </Button>
          </span>
        );
      },
    },
  ];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, total: 0 });
  const [localapi, setLocalApi] = useState(localStorage.getItem("Local") || false);
  const [messageApi, contextHolder] = message.useMessage();


  const setLocal = () => {
    if (localapi === 'true') {
      localStorage.setItem("Local", 'false');
      setLocalApi('false')
    } else {
      localStorage.setItem("Local", 'true');
      setLocalApi('true')
    }
  };

  useEffect(() => {
    document.title = "Live Data";
    loadNse(pagination.current);
    const interval = setInterval(() => {
      loadNse(pagination.current);
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, localapi]);


  const loadNse = (page) => {
    if (localapi === 'true' || localapi === true) {
      axios.get(LOCAL_STOCK_API_URL + '/liveStocks').then((response) => {
        setLoading(false);
        setData(response.data.data);
      }).catch(e => { 
        messageApi.open({
          type: "error",
          content: "Check local server",
          duration: 3,
        });
      })
    } else {
      NseService.getLiveStocks(page).then((response) => {
        let buyData = response?.data?.data?.filter((item) => {
          return window.location.pathname === "/admin-live"
        });
        setLoading(false);
        setData(buyData);

        setPagination({
          ...pagination,
          total: response.data.count,
          current: page,
        });
      });
    }
  };


  const getLocalData = async (record) => {
    console.log(record.id);
    try {
      const article = {
        id: record.id,
        admin_call: true,
      };
      await axios({
        method: "put",
        url: localapi === 'true' ? LOCAL_STOCK_API_URL + '/stocks' : nse_api,
        data: article,
      }).then((response) => {

      });
    } catch (err) {
      console.log("Error ", err.response);
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
              <Breadcrumb.Item>Live{localapi === 'true' && ' (local)'}</Breadcrumb.Item>
            </Breadcrumb>

            <div>
              <Switch style={{ float: 'right', marginRight: "28px" }}
                onChange={setLocal}
                checked={localapi === 'true' ? true : false}
              />
            </div>

            <Content
              style={{
                padding: "14px 24px",
                margin: 0,
                minHeight: 280,
              }}
            >

              <Table
                rowKey={(record) => record.id}
                columns={columns}
                dataSource={data}
                loading={loading}
              />

            </Content>
          </Layout>
        </Layout>
      </Layout>
    </>
  );
};

export default LiveNse;
