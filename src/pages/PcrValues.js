import React from "react";
import NavbarMenu from "../components/Navbar";
import moment from "moment/moment";
import { LOCAL_STOCK_API_URL, PCR_VALUE_API } from "../api/LocalApi";
import { Button, Col, Row, Spin } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Input, Tag, Switch, Select as SelectAntd } from "antd";
import Model from "./Model";
import './style.css'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const { Option } = SelectAntd;

function PcrValues() {
  const [getdata, setGet_data] = useState([]);
  const [fruit, setFruit] = useState('');

  const [search_data, setSearch_data] = useState([]);
  const [loading,setLoading] = useState(true)
  const { Search } = Input;
  const [localapi, setLocalApi] = useState(localStorage.getItem("Local"));


  useEffect(() => {
    document.title = "Stock List";
    stock_data();
  }, []);
  
  const setLocal = () => {
    if (localapi === 'true') {
      localStorage.setItem("Local", 'false');
      setLocalApi('false')
    }else{ 
      localStorage.setItem("Local", 'true');
      setLocalApi('true')
    }
  };

  let handleFruitChange = (e) => {
    setFruit(e);
  };

  const updatePcrHandle = () => { 
    notify()
    axios.get(LOCAL_STOCK_API_URL + '/pcrUpdate/')
    .then((response) => { 
      console.log(response);
    }).catch(error => { 
      notifyError()
    })
  }

  const stock_data = async () => {
    await axios.get(PCR_VALUE_API).then((responses) => {
      setLoading(false)
      setGet_data(responses.data.data);
    });
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      width: "8%",
      //   render: (text, record, index) => index + 1,
    },
    {
      title: "Stock Name",
      dataIndex: "name",
      width: "20%",
      filteredValue: [search_data],
      onFilter: (vaule, record) => {
        return String(record.name).toLowerCase().includes(vaule.toLowerCase());
      },
      sorter: (a, b) => a.pcr - b.pcr,
    },
    {
      title: "Pcr Value",
      dataIndex: "pcr",
      width: "15%",
      sorter: (a, b) => a.pcr - b.pcr,
      render: (text, record) => {
        return (
          <Tag color={record.PE === true ? "error" : (record.PE_CE_diffrent === true ? "success" : '')}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      width: "27%",
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
      render: (text, record) => {
        return moment(text).format("DD/MM/YYYY HH:mm:ss");
      },

    },
    {
      title: "Action",
      render: (_, record) =>
        getdata.length >= 1 ? (
          <>

            <Button
              style={{ margin: "15px" }}
              onClick={() => { 
                setFruit(record.name)
                showModal()
                }}
            >
              Get Data
            </Button>
            {/* <Button
              onClick={() => setFruit(record.name)}
              style={{ margin: "15px" }}
            >
              Update
            </Button> */}
            
          </>
        ) : null,
    },
  ];
    const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const [pagination, setPagination] = useState({ current: 1, total: 0, pageSize: 30  });
  const handleTableChange = (value) => {
    setPagination(value)
  }

  const notify = () => toast.info('Update will take some time', {
                                  position: "top-right",
                                  autoClose: 3000,
                                  hideProgressBar: false,
                                  closeOnClick: true,
                                  pauseOnHover: true,
                                  draggable: true,
                                  progress: undefined,
                                  theme: "light",
                                  });

    const notifyError = () => toast.error('Please check local URL', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      });
    
  
  return (
    <>
      <NavbarMenu />

      <Model
        showModal={showModal}
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        namess={fruit}
        localapi={localapi}
      />
      
      <Row>
        <Col offset={15} span={3}>

          <div style={{ marginTop: '15px'}}>
            Local: <Switch
              onChange={setLocal}
              checked={localapi === 'true' ? true : false}
              />
          </div>

            {
              localapi === 'true' &&
              <Button onClick={updatePcrHandle} style={{ marginTop: "20px"}}>Update all</Button>
            }

        </Col>
        
        <Col span={6}>
            {/* <FormControl > */}
              {/* <InputLabel id="demo-simple-select-label">Stock Name</InputLabel>
                <Select
                  value={fruit ?? ""}
                  style={{ marginBottom: "15px" }}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Stock"
                  onChange={handleFruitChange}
                >
                  {getdata.map((fruit, i) => (
                    <MenuItem key={i} value={fruit.name}>
                      {fruit.name}
                    </MenuItem>
                  ))}
                </Select> */}
            {/* </FormControl> */}

                <SelectAntd placeholder={'Stocks'} onChange={handleFruitChange} style={{ width: "250px", marginTop: "15px"}} value={fruit || undefined}>
                    {getdata.map((fruit_D, i) => (
                      <Option key={i} value={fruit_D.name}>{fruit_D.name}</Option>
                    ))}
                  </SelectAntd>

                <Search
                  style={{
                    fontSize: 2,
                    color: "#1890ff",
                    width: 250,
                    marginBottom: 15,
                    marginTop: "15px",
                  }}
                  placeholder="Search"
                  allowClear
                  enterButton="Search"
                  size="default"
                  onSearch={(value) => {
                    setSearch_data(value);
                  }}
                />
        </Col>
      </Row>

  
        
            <>
            {/* <Skeleton size="large" title={false} paragraph={{rows: 20}} loading={loading} active> */}
            {/* {(loading === true)?(<ReactLoading type={'spinningBubbles'} color={'#000'} height={'20%'} width={'6%'} className='loader' />) : ( */}
            <Table
              rowKey={(record) => record.id}
              columns={columns}
              dataSource={getdata}
              pagination={{ ...pagination }}
              onChange={handleTableChange}
              loading={{ indicator: <div><Spin size="small" /></div>, spinning:loading}}
            />
            {/* )}  */}
            {/* </Skeleton> */}
          </>
        
    </>
  );
}
export default PcrValues;
