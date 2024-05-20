import React, { useEffect, useState } from "react";
import { PCR_STOCK_URL } from "../api/FetchApi";
import axios from "axios";
import { Button, Modal, message } from "antd";
import { Table } from "react-bootstrap";
import { ReloadOutlined } from "@ant-design/icons";
import { Skeleton } from "antd";
import { LOCAL_STOCK_API_URL, SETTINGS_API } from "../api/LocalApi";
import { toast } from 'react-toastify';


const Model = (props) => {
  let name = props.namess;
  const [messageApi, contextHolder] = message.useMessage();

  const [localStrg, setLocalStrg] = useState(props.localapi);
  const [loading, setLoading] = useState(true);

  const [liveprice, setLiveprice] = useState([]);
  const [timestamp, setTimeStamp] = useState([]);
  const [pcrValue, setPcrValue] = useState([]);
  const [lessThanLive, setLessThanLive] = useState([]);
  const [graterThanLive, setGraterThan] = useState([]);
  const [ceMax, setCEmax] = useState([]);
  const [peMax, setPEmax] = useState([]);

  const [FutureProfit, setFutureProfit] = useState(0);
  const [FutureLoss, setFutureLoss] = useState(0);
  const [isLiveStock, setIsLiveStock] = useState(false);

  const [loadingButton, setButtonLoading] = useState(false);
  const [loadingButtonSell, setButtonLoadingSell] = useState(false);

  useEffect(() => {
    localStorage.setItem("name", props.namess);
    if (localStrg === 'false') {
      if (liveprice.length !== 0) {
        setLiveprice([]);
        setTimeStamp([]);
        setPcrValue([]);
        setLessThanLive([]);
        setGraterThan([]);
        setCEmax([]);
        setPEmax([]);
        setLoading(true)
      }
    } else {
      setLoading(true)
    }
    setLocalStrg(localStorage.getItem("Local"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, props.localapi]);

  useEffect(() => {
    if (props.isModalOpen) {
      getLocalData()
      if (localStrg === 'true') {
        localApiData();
      } else {
        getApiData()
        const interval = setInterval(() => {
          getApiData();
        }, 10000);
        return () => clearInterval(interval);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, props.localapi, props.isModalOpen]);

  async function localApiData() {
    try {
      await axios({
        method: "GET",
        url: LOCAL_STOCK_API_URL + '/api/getStock/' + props.namess,
      }).then((response) => {
        let data = response?.data?.data[0]
        setLiveprice(data.livePrice)
        setTimeStamp(data.timestamp)
        setPcrValue(data.pcr)
        setLessThanLive(data.down_price)
        setGraterThan(data.up_price)
        setCEmax(data.CEMax)
        setPEmax(data.PEMax)
        setLoading(false);
      })
    }
    catch (err) {
      messageApi.open({
        type: "error",
        content: "try after sometime or check local server",
        duration: 2,
      });
    }
  }

  async function getApiData() {
    let d = localStorage.getItem("name");
    if (d !== null) {
      try {
        await axios.get(PCR_STOCK_URL + d).then((json) => {
          let time_stamp = json.data.records.timestamp;
          setTimeStamp(time_stamp);
          let liveprices = json.data.records.underlyingValue;
          setLiveprice(liveprices);
          // < ----------------- PCR Value ------------------------------->
          const sum = json.data.filtered.CE.totOI;
          const sum2 = json.data.filtered.PE.totOI;
          const pcR = sum2 / sum;
          let PCR = pcR.toFixed(2);
          setPcrValue(PCR);
          // < ---------------- LessThanLive -------------------------------->
          let down_price = json.data.filtered.data.filter((val) => {
            let r = val.strikePrice;
            return r <= liveprices;
          });
          setLessThanLive(down_price);
          // < ---------------- GraterThan -------------------------------->
          let up_price = json.data.filtered.data.filter((val) => {
            let r = val.strikePrice;
            return r >= liveprices;
          });
          setGraterThan(up_price);
          // < ------------------------------------------------>
          let PE_CE_SUM = down_price.slice(-5).map((val) => {
            var ss = val?.PE?.openInterest + val?.PE?.changeinOpenInterest;
            return ss;
          });
          let compare = (a, b) => {
            return b - a;
          };
          const numAscending = PE_CE_SUM.sort(compare);
          const num = numAscending.slice(0, 1);
          // < ------------------------------------------------>
          let CE_PE_SUM = up_price.slice(0, 5).map((val) => {
            var ss = val?.CE?.openInterest + val?.CE?.changeinOpenInterest;
            return ss;
          });
          let compare1 = (a, b) => {
            return b - a;
          };
          const numAscending1 = CE_PE_SUM.sort(compare1);
          const num1 = numAscending1.slice(0, 1);
          // < ---------------- Pemax -------------------------------->
          const PE_present_price = [];
          const PE_present_price2 = [];
          down_price.filter((ab) => {
            let r = ab?.PE?.changeinOpenInterest + ab?.PE?.openInterest;
            if (r === num[0]) {
              PE_present_price.push(ab);
              PE_present_price2.push(ab.strikePrice);
            }
            return ab;
          });
          setPEmax(PE_present_price);
          // < ----------------- CEmax ------------------------------->
          const CE_present_price = [];
          const CE_present_price2 = [];
          up_price.map((ab) => {
            let r = ab?.CE?.changeinOpenInterest + ab?.CE?.openInterest;
            if (r === num1[0]) {
              CE_present_price.push(ab);
              CE_present_price2.push(ab.strikePrice);
            }
            return ab;
          });
          setCEmax(CE_present_price);
          setLoading(false);
        });
      }
      catch (err) {
        messageApi.open({
          type: "error",
          content: "try after sometime or check local server",
          duration: 2,
        });
      }
    }
  }


  const getLocalData = async () => {
    fetch(SETTINGS_API)
      .then((response) => response.json())
      .then((data) => {
        data?.data?.map((val) => {
          if (val.option === "STOCK FUTURE") {
            setFutureProfit(val.profit_percentage)
            setFutureLoss(val.loss_percentage)
          }
          return val;
        });
        setIsLiveStock(data?.liveSettings[0]?.live_stock);
      }).catch(e => {
        console.log(e);
      })
  }

  const buyFutureHandle = async (type) => {
    const lot = prompt(`${name} ${type} with ${FutureProfit}% profit and ${FutureLoss}% loss \nPlease enter lots!`)

    if (lot !== null && lot !== '') {
      type === 'BUY' ? setButtonLoading(true) : setButtonLoadingSell(true)
      await axios({
        method: "POST",
        url: LOCAL_STOCK_API_URL + '/buyStockFuture',
        data: {
            "STOCK": name,
            "type": type,
            "lots": lot,
            "profit": FutureProfit,
            "loss": FutureLoss,
            "is_live": isLiveStock
        }
      })
        .then((response) => {
          toast.success('orderId: ' + response.data.orderId, {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 4000,
          });
          type === 'BUY' ? setButtonLoading(false) : setButtonLoadingSell(false)
        }).catch(e => {
          toast.error(e.request.status === 0 ? e.message : 'Something went wrong!', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 4000,
          });
          setButtonLoading(false)
        })
    }
  }


  return (
    <>
      {contextHolder}
      <Modal
        width={1200}
        title="STOCK CHART"
        open={props.isModalOpen}
        onOk={props.handleOk}
        onCancel={props.handleCancel}
      >
        <div className="container">
          <div className="row">
            <div className="col-md-5 mb-1 d-inline p-2 bg-success text-white float-left  ">
              Underlying Index:
              <span id="equity_underlyingVal" className="bold ">
                <b>
                  {' '} {name} {liveprice} {' '}
                </b>
              </span>
              <span id="equity_timeStamp" className="asondate">
                As on {timestamp} IST
              </span>
            </div>

            <div className="col-md-1">
              {localStrg !== 'true' ?
                (<ReloadOutlined
                  style={{ fontSize: '20px', marginLeft: '8px', marginTop: '6px' }}
                  onClick={getApiData}
                />) :
                <ReloadOutlined
                  onClick={localApiData}
                  style={{ fontSize: '20px', marginLeft: '8px', marginTop: '6px' }} />
              }
            </div>

            {localStrg === 'true' ?
              <div className="col-md-3 mt-1">
                <label style={{ marginLeft: "15px" }}>Future: </label>
                <Button 
                loading={loadingButton}
                onClick={() => {
                  buyFutureHandle('BUY')
                }} 
                style={{ backgroundColor: "#008F75", color: "white",  marginRight: "6px" }}>BUY</Button>
                <Button 
                loading={loadingButtonSell}
                onClick={() => {
                  buyFutureHandle('SELL')
                }}                
                style={{ backgroundColor: "#D64D4D", color: "white" }}>SELL</Button>
            </div> :
            <div className="col-md-3 mt-1"></div>
            }

            <div className="col-md-3 pr-5">
              <div className="d-inline p-2 bg-success text-white float-right">
                PCR = {Number(pcrValue).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* {(loading === true)?(<ReactLoading type={'spinningBubbles'} color={'#000'} height={'20%'} width={'6%'} className='loader' />) : ( */}
        <Skeleton size="large" title={false} paragraph={{ rows: 15 }} loading={loading} active>
          <div id="chartContainer">
            <Table className="mt-3" id="chartContainer">
              <thead>
                <tr
                  style={{
                    backgroundColor: "	#ffbf00",
                  }}
                >
                  <th width="8%" title="Open Interest in contracts"></th>

                  <th width="30%" title="Open Interest in contracts">
                    PE
                  </th>

                  <th width="35%" title="Strike Price">
                    Strike Price
                  </th>

                  <th width="40%" title="Open Interest in contracts">
                    CE
                  </th>
                </tr>
              </thead>

              <tbody>
                {lessThanLive.slice(-10).map((data, i) => {
                  return (
                    <tr key={i}>
                      <td
                        style={{
                          backgroundColor: "#ECF0F1 ",
                        }}
                      >
                        {data?.PE?.openInterest +
                          data?.PE?.changeinOpenInterest -
                          (data?.CE?.openInterest + data?.CE?.changeinOpenInterest)}
                      </td>
                      <td
                        style={{
                          backgroundColor: peMax[0]?.strikePrice === data?.strikePrice ? "#ff1000" : null,
                        }}
                      >
                        {data?.PE?.openInterest + data?.PE?.changeinOpenInterest}
                      </td>
                      <td
                        style={{
                          backgroundColor: "#66CDAA",
                        }}
                      >
                        <b>{data.strikePrice}</b>
                      </td>

                      <td
                        style={{
                          backgroundColor: "#33F9FF",
                        }}
                      >
                        {data?.CE?.openInterest + data?.CE?.changeinOpenInterest}
                      </td>
                    </tr>
                  );
                })}

                {graterThanLive.slice(0, 10).map((data, i) => {
                  return (
                    <tr key={i}>
                      <td
                        style={{
                          backgroundColor: "#ECF0F1 ",
                        }}
                      >
                        {+(data?.PE?.openInterest + data?.PE?.changeinOpenInterest) -
                          (data?.CE?.openInterest + data?.CE?.changeinOpenInterest)}
                      </td>
                      <td
                        style={{
                          backgroundColor: "#33F9FF",
                        }}
                      >
                        {data?.PE?.changeinOpenInterest + data?.PE?.openInterest}
                      </td>

                      <td
                        style={{
                          backgroundColor: "#66CDAA",
                        }}
                      >
                        <b>{data.strikePrice}</b>
                      </td>

                      <td
                        style={{
                          backgroundColor: ceMax[0]?.strikePrice === data?.strikePrice ? "#ff1000" : null,
                        }}
                      >
                        {data?.CE?.openInterest + data?.CE?.changeinOpenInterest}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Skeleton>
        {/* )} */}
      </Modal>
    </>
  );
};

export default Model;
