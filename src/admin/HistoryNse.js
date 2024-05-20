import React from "react";
import { Layout, Table, Tag, Breadcrumb, Switch, DatePicker, Row, Col, message } from "antd";
import NseService from "../services/NseService";
import { useEffect, useState } from "react";
import moment from "moment/moment";
import Sidebar from "./Sidebar";
import axios from "axios";
import { LOCAL_STOCK_API_URL } from "../api/LocalApi";

const { RangePicker } = DatePicker;
const { Header } = Layout;
const { Content } = Layout;

const HistoryData = () => {
  const dateFormatList = ["YYYY-MM-DD", "DD-MM-YYYY"];

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
      render: (text, record) => {
        return text ?? "-";
      },
    },
    {
      title: "Live Price",
      dataIndex: "live_Strike_price",
      key: "live_Strike_price",
      render: (text, record) => {
        return text ?? "-";
      },
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
      title: "Exit Price",
      dataIndex: "exit_price",
      key: "exit_price",
      render: (text, record) => {
        return <Tag color={text !== null ? "error" : ""}>{text}</Tag>;
      },
    },
    {
      title: "Exit OI",
      dataIndex: "oi_diff",
      key: "oi_diff",
      render: (text, record) => {
        return text ?? "-";
      },
    },
    {
      title: "Buy Time",
      dataIndex: "buy_time",
      key: "buy_time",
      sorter: (a, b) => moment(a.buy_time).unix() - moment(b.buy_time).unix(),

      render: (text, record) => {
        return moment(text).format("DD/MM/YYYY HH:mm:ss");
      },
    },
    {
      title: "Sell Time",
      dataIndex: "sell_buy_time",
      key: "sell_buy_time",

      sorter: (a, b) =>
        moment(a.sell_buy_time).unix() - moment(b.sell_buy_time).unix(),
      render: (text, record) => {
        return moment(text).format("DD/MM/YYYY HH:mm:ss");
      },
    },
    {
      title: "Option",
      dataIndex: "percentage",
      key: "percentage",
      render: (text, record) => {
        if (
          text.option === "STOCK CE" ||
          text.option === "STOCK PE" ||
          text.option === "STOCK FUTURE" 
        ) {
          return record.stock_name;
        }
        if (text.option === "BANKNIFTY FUTURE" || text.option === 'NIFTY FUTURE') {
          return record.type === "BUY"
            ? text.option + " BUY"
            : text.option + " SELL";
        }
        return text.option;
      },
      filters: [
        {
          text: "BANKNIFTY CE",
          value: "BANKNIFTY CE",
        },
        {
          text: "NIFTY CE",
          value: "NIFTY CE",
        },
        {
          text: "NIFTY PE",
          value: "NIFTY PE",
        },
        {
          text: "BANKNIFTY PE",
          value: "BANKNIFTY PE",
        },
        {
          text: "STOCK CE",
          value: "STOCK CE",
        },
        {
          text: "BANKNIFTY FUTURE",
          value: "BANKNIFTY FUTURE",
        },
        {
          text: "NIFTY FUTURE",
          value: "NIFTY FUTURE",
        },
      ],
      onFilter: (value, record) => {
        return record.percentage.option === value;
      },
    },
    {
      title: "Final Status",
      dataIndex: "final_status",
      key: "final_status",
      filters: [
        {
          text: "PROFIT",
          value: "PROFIT",
        },
        {
          text: "LOSS",
          value: "LOSS",
        },
      ],
      onFilter: (value, record) => {
        return record.final_status === value;
      },
      render: (text, record) => {
        return (
          <Tag color={text === "PROFIT" ? "success" : "error"}>
            {text}
            <br />
            {record?.PL && record?.PL?.toFixed(2)}
          </Tag>
        );
      },
    },
  ];

  const [data, setData] = useState([]);
  const [PL, setPL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, total: 0 });
  const [localapi, setLocalApi] = useState(localStorage.getItem("Local"));
  const [dateRange, setDateRange] = useState({ from: 0, to: 0 });
  const [messageApi, contextHolder] = message.useMessage();

  const setLocal = () => {
    if (localapi === "true") {
      localStorage.setItem("Local", "false");
      setLocalApi("false");
    } else {
      localStorage.setItem("Local", "true");
      setLocalApi("true");
    }
  };

  useEffect(() => {
    document.title = "History Data";
    !PL && loadNse(pagination.current);
    PL && filterData(dateRange.from, dateRange.to, pagination.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, localapi]);

  const loadNse = (page) => {
    if (localapi === "true") {
      axios
        .get(LOCAL_STOCK_API_URL + "/stocks?page=" + page)
        .then((response) => {
          let buyData = response?.data?.data?.data?.filter((item) => {
            return item.status === "SELL";
          });
          setLoading(false);
          setData(buyData);
          setPagination({
            ...pagination,
            total: response.data.count,
            current: page,
          });
        }).catch(e => {
          messageApi.open({
            type: "error",
            content: "Check local server",
            duration: 3,
          });
        })
    } else {
      NseService.getNse(page).then((response) => {
        let buyData = response?.data?.data?.filter((item) => {
          return item.status === "SELL";
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

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const filterData = (from, to, page) => {
    setLoading(true);
    axios({
      method: "GET",
      url: LOCAL_STOCK_API_URL + `/stocks?start_date=${from}&end_date=${to}&page=${page}`,
    }).then((response) => {
      setData(response?.data?.data?.data);
      setPL(response?.data?.data?.total_PL);
      setLoading(false);
      setPagination({
        ...pagination,
        total: response.data.count,
        current: pagination.current,
      });
    }).catch(e => {
      messageApi.open({
        type: "error",
        content: "Check local server",
        duration: 3,
      });
    })
  };

  const onRangeChange = (dates, dateStrings) => {
    if (dates) {
      if (localapi === "true") {
        filterData(dateStrings[0], dateStrings[1], 1);
        setDateRange({ from: dateStrings[0], to: dateStrings[1] });
      } else {
        messageApi.open({
          type: "warning",
          content: "Start local server to use filter",
          duration: 3,
        });
      }
    } else {
      setPL(null);
      loadNse(1);
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

          <Layout
            className="site-layout-background"
            style={{ margin: "24px 16px 0" }}
          >
            <Breadcrumb style={{ margin: "16px 30px" }}>
              <Breadcrumb.Item>Admin</Breadcrumb.Item>
              <Breadcrumb.Item>
                History{localapi === "true" && " (local)"}
              </Breadcrumb.Item>
            </Breadcrumb>

            <Row>
              <Col offset={11} span={3}>

                {PL ? (
                  <>
                    P&L: {" "}
                    <Tag
                      style={{
                        marginTop: "9px",
                        fontSize: "15px",
                        width: "fit-content",
                      }}
                      color={PL <= 0 ? "error" : "success"}
                    >
                      {PL}
                    </Tag>
                  </>
                ) : ("")
                }
              </Col>

              <Col span={7}>
                <RangePicker
                  // className="mr-3"
                  onChange={onRangeChange}
                  format={dateFormatList}
                  size={"large"}
                />
              </Col>

              <Col span={3}>

                <Switch
                  style={{ marginTop: "8px" }}
                  onChange={setLocal}
                  checked={localapi === "true" ? true : false}
                />
              </Col>

            </Row>


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
                pagination={{
                  ...pagination,
                  showSizeChanger: false,
                }}
                onChange={handleTableChange}
              />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </>
  );
};

export default HistoryData;
