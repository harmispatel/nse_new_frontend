import NseService from "../services/NseService";
import { LOCAL_BASE_URL, live_put } from "../api/LocalApi";
import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Layout,
  Table,
  Typography,
  Breadcrumb,
  Button,
  Select as SelectAntd
} from "antd";
import Sidebar from "./Sidebar";
import { Content, Header } from "antd/es/layout/layout";
import moment from "moment/moment";
import {
  PCR_VALUE_API,
  SELECT_STOCK_NAME,
  SELECT_STOCK_NAME_PUT,
} from "../api/LocalApi";
const { Option } = SelectAntd;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode =
    (inputType === 'number') ? (<InputNumber />) :
      (
        (inputType === 'select') ? (
          (
            <SelectAntd style={{ width: '100%' }}>
              <Option value="NA">NA</Option>
              <Option value="old">Old</Option>
              <Option value="15min">15 min</Option>
            </SelectAntd>
          )
        ) : (
          <Input />
        )
      );


  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) :
        (
          dataIndex === 'used_logic' ? (<span>{record[dataIndex]}</span>) : (children)
        )
      }
    </td>
  );
};

const SettingsNse = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bankniftyLiveSettings, setBankNiftyLive] = useState();
  const [niftyLiveSettings, setNiftyLive] = useState();
  const [stockLiveSettings, setStockLive] = useState();

  const [editingKey, setEditingKey] = useState("");

  useEffect(() => {
    document.title = "Settings";
    loadNse_setting();
  }, []);

  const loadNse_setting = () => {
    let nseData = [];
    NseService.setting_get().then((response) => {
      setBankNiftyLive(response.data?.liveSettings?.[0]?.live_banknifty)
      setNiftyLive(response.data?.liveSettings?.[0]?.live_nifty)
      setStockLive(response.data?.liveSettings?.[0]?.live_stock)

      response.data.data.filter((item) => {
        nseData.push({
          key: item.id,
          id: item.id,
          option: item.option,
          profit_percentage: item.profit_percentage,
          loss_percentage: item.loss_percentage,
          set_pcr: item.set_pcr,
          baseprice_plus: item.baseprice_plus,
          quantity_bn: item.quantity_bn,
          oi_total: item.oi_total,

        });
        return window.location.pathname === "/admin-settings";
      });
      setData(nseData);
      setLoading(false);
    });
  };

  const isEditing = (record) => record.id === editingKey;
  const edit = (record) => {
    form.setFieldsValue({
      option: record.option,
      profit_percentage: record.profit_percentage,
      loss_percentage: record.loss_percentage,
      set_pcr: record.set_pcr,
      baseprice_plus: record.baseprice_plus,
      quantity_bn: record.quantity_bn,
      oi_total: record.oi_total,
      ...record
    });
    setEditingKey(record.id);
  };
  const cancel = () => {
    setEditingKey("");
  };


  const niftyLiveHandle = async (value) => {

    let d = value;

    if (d !== false) {
      let article = {
        id: 1,
        live_nifty: false,
      };
      axios({
        method: "put",
        url: live_put,
        data: article,
      }).then((response) => {
        setNiftyLive(false);
      });
    } else {
      let article = {
        id: 1,
        live_nifty: true,
      };
      axios({
        method: "put",
        url: live_put,
        data: article,
      }).then((response) => {
        setNiftyLive(true);
      });
    }
  };

  const bankniftyLiveHandle = async (value) => {
    let d = value
    if (d !== false) {
      let article = {
        id: 1,
        live_banknifty: false,
      };
      axios({
        method: "put",
        url: live_put,
        data: article,
      }).then((response) => {
        setBankNiftyLive(false);
      });
    } else {
      let article = {
        id: 1,
        live_banknifty: true,
      };
      axios({
        method: "put",
        url: live_put,
        data: article,
      }).then((response) => {
        setBankNiftyLive(true);
      });
    }
  };

  const stockLiveHandle = async (value) => {
    let d = value
    if (d !== false) {
      let article = {
        id: 1,
        live_stock: false,
      };
      axios({
        method: "PUT",
        url: live_put,
        data: article,
      }).then((response) => {
        setStockLive(false);
      });
    } else {
      let article = {
        id: 1,
        live_stock: true,
      };
      axios({
        method: "PUT",
        url: live_put,
        data: article,
      }).then((response) => {
        setStockLive(true);
      });
    }
  };

  const save = async (id) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => id === item.id);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey("");

        try {
          const article = {
            profit_percentage: row.profit_percentage,
            loss_percentage: row.loss_percentage,
            set_pcr: row.set_pcr,
            baseprice_plus: row.baseprice_plus,
            quantity_bn: row.quantity_bn,
            oi_total: row.oi_total,
          };

          await axios({
            method: "put",
            url: LOCAL_BASE_URL + `/patch_stock/` + id,
            data: article,

          }).then((response) => {
          });
        } catch (err) {
          console.log("Error ", err.response);
        }
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };


  const [stock_name_colour_green, setStock_name_colour_green] = useState([]);
  const [stock_name_put, setStock_name_put] = useState([]);

  const [fruit_stock, setFruit_stock] = useState('');
  const [fruit_stock_put, setFruit_stock_put] = useState([]);



  useEffect(() => {
    getall_data();
    stock_buy();
  }, []);

  const getall_data = () => {
    axios.get(SELECT_STOCK_NAME).then(async (response) => {
      let d = response.data.data;
      setFruit_stock(d[0]?.name);
    });

    axios.get(SELECT_STOCK_NAME_PUT).then(async (response) => {
      let d = response.data.data;

      setFruit_stock_put(d[0]?.name);
    });
  };

  let handleFruitChange_stock = async (e) => {
    console.log(e);
    setFruit_stock(e);
    await axios.get(SELECT_STOCK_NAME).then(async (response) => {
      let d = response.data.data;

      if (d.length === 0) {
        try {
          const article = {
            name: e,
          };

          await axios({
            method: "post",
            url: SELECT_STOCK_NAME,
            mode: "cors",
            data: article,
          }).then((response) => {
          });
        } catch (err) {
          console.log("Error", err.response);
        }
      } else if (d.length === 1) {
        try {
          const article = {
            id: 1,
            name: e,
          };

          await axios({
            method: "put",
            url: SELECT_STOCK_NAME,
            mode: "cors",
            data: article,
          }).then((response) => {
          });
        } catch (err) {
          console.log("Error", err.response);
        }
      }
    });
  };

  let handleFruitChange_stock_put = async (e) => {
    setFruit_stock_put(e);
    await axios.get(SELECT_STOCK_NAME_PUT).then(async (response) => {
      let d = response.data.data;

      if (d.length === 0) {
        try {
          const article = {
            name: e,
          };

          await axios({
            method: "post",
            url: SELECT_STOCK_NAME_PUT,
            mode: "cors",
            data: article,
          }).then((response) => {
          });
        } catch (err) {
          console.log("Error", err.response);
        }
      } else if (d.length === 1) {
        try {
          const article = {
            id: 1,
            name: e,
          };

          await axios({
            method: "put",
            url: SELECT_STOCK_NAME_PUT,
            mode: "cors",
            data: article,
          }).then((response) => {
          });
        } catch (err) {
          console.log("Error", err.response);
        }
      }
    });
  };

  const stock_buy = async () => {
    await axios.get(PCR_VALUE_API).then(async (response) => {
      let a = response.data.data;
      var date = moment();
      var currentDate = date.format("D/MM/YYYY");
      const values = Object.values(a);
      let data_green = [];
      let data_green_put = [];
      values.map((ab) => {
        var Buy_Date = moment(values.date).format("D/MM/YYYY");
        if (ab.PE_CE_diffrent === true && Buy_Date === currentDate) {
          data_green.push(ab);
        }
        if (ab.PE_CE_diffrent === false && Buy_Date === currentDate) {
          data_green_put.push(ab);
        }
        return ab
      });
      let data_buy = data_green;
      setStock_name_colour_green(data_buy);
      setStock_name_put(data_green_put);
    });
  };


  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      render: (text, record, index) => index + 1,
      width: "7%",
    },
    {
      title: "Option",
      dataIndex: "option",
      width: "16%",
    },
    {
      title: "Profit",
      dataIndex: "profit_percentage",
      width: "10%",
      editable: true,
    },
    {
      title: "Loss",
      dataIndex: "loss_percentage",
      width: "10%",
      editable: true,
    },
    {
      title: "Set Pcr",
      dataIndex: "set_pcr",
      width: "10%",
      editable: true,
    },
    {
      title: "Baseprice Plus",
      dataIndex: "baseprice_plus",
      width: "10%",
      editable: true,
    },
    {
      title: "Lots",
      dataIndex: "quantity_bn",
      width: "10%",
      editable: true,
    },
    {
      title: "OI total",
      dataIndex: "oi_total",
      width: "10%",
      editable: true,
    },
    {
      title: "Operation",
      dataIndex: "operation",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.id)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Typography.Link>
            {/* <br /> */}
            <Typography.Link onClick={cancel}>Cancel</Typography.Link>
          </span>
        ) : (
          <Typography.Link
            disabled={editingKey !== ""}
            onClick={() => edit(record)}
          >
            Edit
          </Typography.Link>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'age' || col.dataIndex === 'used_logic' ? 'select' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });


  return (
    <>
      <Layout>
        <Header className="head-main">
          <div className="logo" />
        </Header>
        <Layout>
          <Sidebar />

          <Layout className="site-layout-background" style={{ margin: "24px 16px 0" }}>
            <Breadcrumb style={{ margin: "16px 30px" }}>
              <Breadcrumb.Item>Admin</Breadcrumb.Item>
              <Breadcrumb.Item>Settings</Breadcrumb.Item>
            </Breadcrumb>

            <div>

              {niftyLiveSettings !== undefined &&
                <Button
                  style={{
                    float: "left",
                    margin: "25px 20px",
                    backgroundColor: niftyLiveSettings === true ? "#72ED90 " : "white",
                    color: niftyLiveSettings === true && "black",
                  }}
                  onClick={() => { niftyLiveHandle(niftyLiveSettings) }}
                >
                  Nifty
                </Button>
              }

              {bankniftyLiveSettings !== undefined &&
                <Button
                  style={{
                    float: "left",
                    margin: "25px 20px",
                    backgroundColor: bankniftyLiveSettings === true ? "#72ED90 " : "white",
                    color: bankniftyLiveSettings === true && "black",
                  }}
                  onClick={() => { bankniftyLiveHandle(bankniftyLiveSettings) }}
                >
                  BankNifty
                </Button>
              }

              {stockLiveSettings !== undefined &&
                <Button
                  style={{
                    float: "left",
                    margin: "25px 20px",
                    backgroundColor: stockLiveSettings === true ? "#72ED90 " : "white",
                    color: stockLiveSettings === true && "black",
                  }}
                  onClick={() => { stockLiveHandle(stockLiveSettings) }}
                >
                  Stock
                </Button>
              }


              <div style={{ margin: "10px", marginRight: "40px", float: "right" }}>
                <p style={{ fontSize: "12px", marginBottom: "0", marginLeft: "-65px" }}>Stock of call: </p>
                <SelectAntd onChange={handleFruitChange_stock} style={{ width: "150px" }} value={fruit_stock}>
                  {stock_name_colour_green.map((fruit_D, i) => (
                    <Option key={i} value={fruit_D.name}>{fruit_D.name}</Option>
                  ))}
                </SelectAntd>
              </div>

              <div style={{ margin: "10px", marginRight: "40px", float: "right" }}>
                <p style={{ fontSize: "12px", marginBottom: "0", marginLeft: "-65px" }}>Stock of put: </p>
                <SelectAntd onChange={handleFruitChange_stock_put} style={{ width: "150px" }} value={fruit_stock_put}>
                  {stock_name_put.map((fruit_D, i) => (
                    <Option key={i} value={fruit_D.name}>{fruit_D.name}</Option>
                  ))}
                </SelectAntd>
              </div>

            </div>

            <Content

              style={{
                padding: "0px 30px",
                margin: 0,
                minHeight: 280,
              }}
            >

              <Form form={form} component={false}>
                <Table
                  loading={loading}
                  components={{
                    body: {
                      cell: EditableCell,
                    },
                  }}
                  dataSource={data}
                  columns={mergedColumns}
                  pagination={{ pageSize: 30 }}
                  rowClassName="editable-row"
                />

              </Form>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </>
  );
};
export default SettingsNse;
