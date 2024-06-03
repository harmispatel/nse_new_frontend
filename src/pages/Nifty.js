import React, { useState, useEffect } from "react";
import axios from "axios";
import { NIFTY_API } from "../api/FetchApi";
import { SETTINGS_API } from "../api/LocalApi";
import NavbarMenu from "../components/Navbar";
import { Table } from "react-bootstrap";
import { Spin } from "antd";

const Nifty = () => {
  const [timestamp, setTimeStamp] = useState([]);
  const [liveprice, setLiveprice] = useState([]);
  const [graterThanLive, setGraterThan] = useState([]);
  const [lessThanLive, setLessThanLive] = useState([]);
  const [ceMax, setCEmax] = useState([]);
  const [peMax, setPEmax] = useState([]);
  const [callStrike, setCallStrike] = useState([]);
  const [putStrike, setPutStrike] = useState([]);
  const [pcrValue, setPcrValue] = useState([]);
  const [cepeDiffrent, setCePeDiffrent] = useState([]);
  const [basePlus, setBasePlus] = useState(0);
  const [callPcr, setCallPcr] = useState(0);
  const [oiSetting, setOiSetting] = useState([]);
  const [oiSettingPut, setOiSettingPut] = useState(0);
  const [liveprice_put, setLiveprice_put] = useState([]);
  const [basePlus_put, setBasePlus_put] = useState(0);
  const [putPcr_put, setPutPcr_put] = useState(0);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    document.title = "Nifty";
    getLocalData();
    getApiData();
    
    // const interval = setInterval(() => {
    //   getLocalData();
    //   getApiData();

    // }, 10000);
    // return () => clearInterval(interval);
  }, []);




  useEffect(() => {
    callPcr && basePlus && mainBuyConditionFun();
    basePlus_put && putPcr_put && mainBuyConditionFunput();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [putStrike, callStrike, cepeDiffrent, basePlus, basePlus_put, callPcr, basePlus_put]);

  useEffect(() => {
    if (oiSetting && oiSettingPut) {
      strikePriceLogic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oiSetting, oiSettingPut, cepeDiffrent]);


  // API DATA
  async function getApiData() {
    await axios
      .get(NIFTY_API)
      .then((json) => { 
        setApiData(json.data)
        let time_stamp = json.data.data.records.timestamp;
        setTimeStamp(time_stamp);
        // < ---------------- Liveprice -------------------------------->
        let liveprices = json.data.data.records.underlyingValue;
        setLiveprice(liveprices);
        setLiveprice_put(liveprices);
        // console.log("json.data.filtered.data",json.data.filtered.data)
        // < ---------------- GraterThan -------------------------------->
        let up_price = json.data.data.filtered.data.filter((val) => {
          let r = val.strikePrice;
          return r >= liveprices;
        });
        setGraterThan(up_price);
        // < ---------------- LessThanLive -------------------------------->
        let down_price = json.data.data.filtered.data.filter((val) => {
          let r = val.strikePrice;
          return r <= liveprices;
        });
        setLessThanLive(down_price);
        // < ------------------------------------------------>
        let PE_CE_SUM = down_price.slice(-5).map((val) => {
          var ss = val.PE.openInterest + val.PE.changeinOpenInterest;
          return ss;
        });
        let compare = (a, b) => {
          return b - a;
        };
        const numAscending = PE_CE_SUM.sort(compare);
        const num = numAscending.slice(0, 1);
        // < ------------------------------------------------>
        let CE_PE_SUM = up_price.slice(0, 5).map((val) => {
          var ss = val.CE.openInterest + val.CE.changeinOpenInterest;
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
          let r = ab.PE.changeinOpenInterest + ab.PE.openInterest;
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
          let r = ab.CE.changeinOpenInterest + ab.CE.openInterest;
          if (r === num1[0]) {
            CE_present_price.push(ab);
            CE_present_price2.push(ab.strikePrice);
          }
          return ab;
        });
        setCEmax(CE_present_price);

        // < ----------------- PCR Value ------------------------------->
        const sum = json.data.data.filtered.CE.totOI;
        const sum2 = json.data.data.filtered.PE.totOI;
        const PCR = sum2 / sum;
        setPcrValue(PCR);
        // < ----------------- CE PE Diffrent ------------------------------->
        const CE_PE_Diffrent = [];
        PE_present_price.map((ab) => {
          let a =
            ab.PE.openInterest +
            ab.PE.changeinOpenInterest -
            (ab.CE.openInterest + ab.CE.changeinOpenInterest);
          CE_PE_Diffrent.push(a);
          return ab;
        });
        setCePeDiffrent(CE_PE_Diffrent);
        setLoading(false)
        // < ------------------------------------------------>
      })
      .catch((e) => console.log(e));
  }

  const getLocalData = async () => {
    fetch(SETTINGS_API)
      .then((response) => response.json())
      .then((data) => {
        data.data.map((val) => {
          if (val.option === "NIFTY CE") {
            setCallPcr(val.set_pcr);
            setBasePlus(val.baseprice_plus);
            setOiSetting(val.oi_total);
          }
          if (val.option === "NIFTY PE") {
            setPutPcr_put(val.set_pcr);
            setBasePlus_put(val.baseprice_plus);
            setOiSettingPut(val.oi_total)
          }
          return val;
        });
      });
  };

  

  const strikePriceLogic = () => {
    if (apiData.length !== 0) {

      let liveprices = apiData?.data?.records?.underlyingValue

      let up_price = apiData?.data.filtered.data.filter((val) => {
        let v1 = val.strikePrice;
        return v1 >= liveprices;
      });
      let down_price = apiData?.data.filtered.data.filter((val) => {
        let v1 = val.strikePrice;
        return v1 <= liveprices;
      });

      // NEW STRIKE PRICE CONDITION
      const up_first_total_oi = (up_price[0].PE.changeinOpenInterest + up_price[0].PE.openInterest) - (up_price[0].CE.changeinOpenInterest + up_price[0].CE.openInterest)
      const down_first_total_oi = (down_price.slice(-1)[0].PE.changeinOpenInterest + down_price.slice(-1)[0].PE.openInterest) - (down_price.slice(-1)[0].CE.changeinOpenInterest + down_price.slice(-1)[0].CE.openInterest)
      // CALL
      const base_Price_down = []
      const Total_oi_down_arr = []
      for (const val of down_price.slice(-4).reverse()) {
        var PE_oi_down = val.PE.openInterest + val.PE.changeinOpenInterest;
        var CE_oi_down = val.CE.openInterest + val.CE.changeinOpenInterest;
        var Total_oi_down = PE_oi_down - CE_oi_down
        Total_oi_down_arr.push(Total_oi_down)
        if (Total_oi_down > oiSetting) {
          if (Math.abs(Total_oi_down_arr[0]) === Math.abs(Total_oi_down)) {
            if (Math.abs(up_first_total_oi) < Math.abs(Total_oi_down_arr[0])) {
              base_Price_down.push(val);
              break;
            }else{ 
              continue
            }
          }
          base_Price_down.push(val)
          break
        }
      };
      setCallStrike(base_Price_down)

      // PUT
      const base_Price_up = []
      const Total_oi_up_arr = []
      for (const val of up_price.slice(0, 5)) {
        var PE_oi_up = val.PE.openInterest + val.PE.changeinOpenInterest;
        var CE_oi_up = val.CE.openInterest + val.CE.changeinOpenInterest;
        var Total_oi_up = PE_oi_up - CE_oi_up
        Total_oi_up_arr.push(Total_oi_up)
        if (Math.abs(Total_oi_up) > Math.abs(oiSettingPut) && Total_oi_up < 0) {
          if (Math.abs(Total_oi_up_arr[0]) === Math.abs(Total_oi_up)) {
            if (down_first_total_oi < Math.abs(Total_oi_up_arr[0])) {
              base_Price_up.push(val);
              break;
            }else{ 
              continue
            }
          }
          base_Price_up.push(val)
          break
        }
      };
      setPutStrike(base_Price_up)
    }
  }

  const [basePricePlus, setBasePricePlus] = useState(0);
  const [basePricePlusPut, setBasePricePlusPut] = useState(0);


  const mainBuyConditionFun = () => {

    callStrike.map((val) => {
      if (pcrValue >= callPcr) {
        let basePricePlus = val.strikePrice + basePlus;
        let base_a = basePricePlus - 15;
        setBasePricePlus(basePricePlus)
        if (base_a <= liveprice && liveprice <= basePricePlus) {
          console.log('Successfully buy');
        }
      } else {
        setBasePricePlus(0)
      }
      return val;
    });
  };

  const mainBuyConditionFunput = () => {

    putStrike.map((val) => {

      if (pcrValue <= putPcr_put) {
        let basePricePlus = val.strikePrice + basePlus_put;
        let base_a = basePricePlus + 15;
        setBasePricePlusPut(basePricePlus)
        if (base_a <= liveprice_put && liveprice_put <= basePricePlus) {
          console.log('Successfully buy');
        }
      } else {
        setBasePricePlusPut(0)
      }
      return val;
    });
  };


  return (
    <>
      <NavbarMenu />

      <div className="container">
        <div className="row justify-content-between" style={{ marginTop: '10px' }}>
          <div className="col-6 d-inline p-2 bg-success text-white float-left">
            Underlying Index:
            <span id="equity_underlyingVal" className="bold ">
              <b> NIFTY {liveprice} </b>
            </span>
            <span id="equity_timeStamp" className="asondate">
              As on {timestamp} IST
            </span>
          </div>

          {/* <div className="col-4 d-inline p-2 bg-success text-white">
              {pcrValue >= callPcr
                ? "BUY CE STRIKE PRICES = " +
                  (buy___p.length === 0 ? "NOT BUY NOW " : buy___p)
                : "BUY PE STRIKE PRICES = " +
                  (sell___p.length === 0 ? "NOT BUY NOW" : sell___p)}
          </div> */}

          {basePricePlus || basePricePlusPut ?
            <div className="col-4 d-inline p-2 bg-success text-white">
              {basePricePlus ? `CE: below ${basePricePlus}` : ''}
              {basePricePlusPut ? ` PE: above ${basePricePlusPut}` : ''}
            </div>
            : ''
          }

          <div className="col-1 d-inline p-2 bg-success text-white float-right">
              PCR = {Number(pcrValue).toFixed(2)}
          </div>
        </div>
      </div>

      <div id="chartContainer">
      <Spin size="large" style={{marginTop: "70px"}} spinning={loading}>
      {/* <Skeleton style={{ marginTop: '15px'}} loading={loading} size="default" title={false} paragraph={{rows: 15}} active> */}
        <Table className="mt-3" id="chartContainer">
          <thead>
            <tr
              style={{
                backgroundColor: "	#ffbf00",
              }}
            >
              <th width="8%" title="Open Interest in contracts"></th>
              <th width="25%" title="Open Interest in contracts">
                PE
              </th>
              <th width="30%" title="Strike Price">
                Strike Price
              </th>
              <th width="25%" title="Open Interest in contracts">
                CE
              </th>
              <th width="8%" title="Open Interest in contracts"></th>

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
                    {data.PE.openInterest +
                      data.PE.changeinOpenInterest -
                      (data.CE.openInterest + data.CE.changeinOpenInterest)}

                      (
                      {(
                      ((data?.CE?.openInterest +
                      data?.CE?.changeinOpenInterest) /
                      (data?.PE?.openInterest +
                      data?.PE?.changeinOpenInterest)) *
                      100
                      ).toFixed(2)}
                      %)
                  </td>
                  <td
                    style={{
                      backgroundColor: peMax[0] === data ? "#ff1000" : null,
                    }}
                  >
                    {data.PE.openInterest + data.PE.changeinOpenInterest}
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
                    {data.CE.openInterest + data.CE.changeinOpenInterest} (
                    {data.PE.changeinOpenInterest < 0
                      ? data.PE.changeinOpenInterest
                      : null}
                    )
                  </td>
                  <td style={{ backgroundColor: "#ECF0F1" }}>
                      (
                      {(
                      ((data?.PE?.openInterest +
                      data?.PE?.changeinOpenInterest) /
                      (data?.CE?.openInterest +
                      data?.CE?.changeinOpenInterest)) *
                      100
                      ).toFixed(2)}
                      %)
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
                    {+(data.PE.openInterest + data.PE.changeinOpenInterest) -
                      (data.CE.openInterest + data.CE.changeinOpenInterest)}

                      
                      (
                      {(
                      ((data?.CE?.openInterest +
                      data?.CE?.changeinOpenInterest) /
                      (data?.PE?.openInterest +
                      data?.PE?.changeinOpenInterest)) *
                      100
                      ).toFixed(2)}
                      %)
                  </td>
                  <td
                    style={{
                      backgroundColor: "#33F9FF",
                    }}
                  >
                    {data.PE.changeinOpenInterest + data.PE.openInterest} (
                    {data.PE.changeinOpenInterest < 0
                      ? data.PE.changeinOpenInterest
                      : null}
                    )
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
                      backgroundColor: ceMax[0] === data ? "#ff1000" : null,
                    }}
                  >
                    {data.CE.openInterest + data.CE.changeinOpenInterest}
                  </td>
                  <td style={{ backgroundColor: "#ECF0F1" }}>
                      (
                      {(
                      ((data?.PE?.openInterest +
                      data?.PE?.changeinOpenInterest) /
                      (data?.CE?.openInterest +
                      data?.CE?.changeinOpenInterest)) *
                      100
                      ).toFixed(2)}
                      %)
                    </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        </Spin>
      </div>
    </>
  );
};

export default Nifty;
