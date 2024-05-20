import React, { useState, useEffect } from "react";
import axios from "axios";
import { BANKNIFTY_API } from "../api/FetchApi";
import { LOCAL_STOCK_API_URL, live_put, nse_api } from "../api/LocalApi";
import { SETTINGS_API } from "../api/LocalApi";
import NavbarMenu from "../components/Navbar";
import { Table } from "react-bootstrap";
import moment from "moment/moment";
import { Spin, Button } from "antd";
import { toast } from "react-toastify";

const AdminBankNifty = () => {
  const [timestamp, setTimeStamp] = useState([]);
  const [liveprice, setLiveprice] = useState([]);
  const [graterThanLive, setGraterThan] = useState([]);
  const [lessThanLive, setLessThanLive] = useState([]);
  const [ceMax, setCEmax] = useState([]);
  const [peMax, setPEmax] = useState([]);
  const [liveBidPrice, setLiveBidprice] = useState([]);
  const [pcrValue, setPcrValue] = useState([]);
  const [cepeDiffrent, setCePeDiffrent] = useState([]);
  const [buyPrice, setBuyPrice] = useState([]);
  const [bidPrice, setBidPrice] = useState([]);
  const [strikePrice, setStrikePrice] = useState([]);
  const [jugad, setJugad] = useState(10);
  const [sellbidPrice, sellBidPrice] = useState([]);

  // LOCAL URL

  const [call, setCAll] = useState("");
  const [put, setPut] = useState("");
  const [basePlus, setBasePlus] = useState([]);

  const [callPcr, setCallPcr] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [optionId, setOptionId] = useState(1);
  const [profitPercentage, setProfitPercentage] = useState([]);
  const [lossPercentage, setLossPercentage] = useState([]);
  const [sellPrice, setSellPrice] = useState([]);
  const [stopLoss, setStopLoss] = useState([]);
  const [oneStock, setOneStock] = useState(true);
  const [sellFunCall, setSellFunCall] = useState(false);
  const [localDataId, setLocalDataId] = useState(false);
  const [buyCondition, setBuyCondition] = useState(true);
  const [finalStatus, setFinalStatus] = useState("NA");
  const [sl, setStoploss_call] = useState([]);
  const [sp, setSquareoff_call] = useState([]);

  // <----------------- put ----------------------------->
  const [buyputPrice, setBuyputPrice] = useState([]);
  const [buyConditionput, setBuyputCondition] = useState(true);
  const [bidPrice_put, setBidPrice_put] = useState([]);
  const [sellPrice_put, setSellPrice_put] = useState([]);
  const [stopLoss_put, setStopLoss_put] = useState([]);
  const [strikePrice_put, setStrikePrice_put] = useState([]);
  const [liveBidPrice_put, setLiveBidprice_put] = useState([]);
  const [sellbidPrice_put, setSellBidPrice_put] = useState([]);
  const [localDataId_put, setLocalDataId_put] = useState(false);
  const [sellFunPut, setSellFunPut] = useState(false);
  const [finalStatus_put, setFinalStatus_put] = useState("NA");
  const [liveprice_put, setLiveprice_put] = useState([]);
  const [oneStock_put, setOneStock_put] = useState(true);
  const [basePlus_put, setBasePlus_put] = useState([]);
  const [putPcr_put, setPutPcr_put] = useState([]);
  const [profitPercentage_put, setProfitPercentage_put] = useState([]);
  const [lossPercentage_put, setLossPercentage_put] = useState([]);
  const [optionId_put, setOptionId_put] = useState(1);
  const [sd, setStoploss_put] = useState([]);
  const [sw, setSquareoff_put] = useState([]);

  const [FutureProfit, setFutureProfit] = useState(0);
  const [FutureLoss, setFutureLoss] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingButton, setButtonLoading] = useState(false);
  const [loadingButtonSell, setButtonLoadingSell] = useState(false);
  const [opFut, setOpFut] = useState('');

  useEffect(() => {
    document.title = "Banknifty";
    getLocalData();
    getApiData();
    let count = 0;
    const interval = setInterval(() => {
      count = count + 1;
      console.log(
        `<--------------------------------------Interval--(${count})--------------------------------------------->`
      );
      count === 31 && window.location.reload();

      getLocalData();
      getApiData();
      conditionFunction();
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cepeDiffrent.length !== 0) {
      getLocalData();
      if (jugad !== 10) {
        mainBuyConditionFun();
        mainBuyConditionFunput();
        conditionFunction();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cepeDiffrent, jugad, buyPrice]);

  useEffect(() => {
    if (bidPrice.length !== 0) {
      postData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bidPrice]);

  useEffect(() => {
    if (bidPrice_put.length !== 0) {
      postData_put();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bidPrice_put]);

  useEffect(() => {
    if (sellFunCall === true) {
      sellData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellFunCall]);

  useEffect(() => {
    if (sellFunPut === true) {
      sellData_put();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellFunPut]);


  async function getApiData() {
    await axios
      .get(BANKNIFTY_API)
      .then((json) => {
        let time_stamp = json.data.records.timestamp;
        setTimeStamp(time_stamp);
        // < ---------------- Liveprice -------------------------------->
        let liveprices = json.data.records.underlyingValue;
        setLiveprice(liveprices);
        setLiveprice_put(liveprices);
        // < ---------------- GraterThan -------------------------------->
        let up_price = json.data.filtered.data.filter((val) => {
          let r = val.strikePrice;
          return r >= liveprices;
        });
        setGraterThan(up_price);
        // < ---------------- LessThanLive -------------------------------->
        let down_price = json.data.filtered.data.filter((val) => {
          let r = val.strikePrice;
          return r <= liveprices;
        });
        setLessThanLive(down_price);
        // < ------------------------------------------------>
        let filterddata = json.data.filtered.data;
        setFilteredData(filterddata);
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
        // < ----------------- Live BD Price ------------------------------->
        PE_present_price.map((ab) => {
          let BD = ab.CE.bidprice;
          setLiveBidprice(BD);
          return ab;
        });

        PE_present_price.map((ab) => {
          let BD = ab.PE.bidprice;
          setLiveBidprice_put(BD);
          return ab;
        });
        // < ----------------- PCR Value ------------------------------->
        const sum = json.data.filtered.CE.totOI;
        const sum2 = json.data.filtered.PE.totOI;
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
        setLoading(false);
        // < ------------------------------------------------>
      })
      .catch((e) => console.log(e));
  }

  const getLocalData = async () => {
    fetch(SETTINGS_API)
      .then((response) => response.json())
      .then((data) => {
        data?.data?.map((val) => {
          if (val.option === "BANKNIFTY CE") {
            setCallPcr(val.set_pcr);
            setBasePlus(val.baseprice_plus);
            setProfitPercentage(val.profit_percentage);
            setLossPercentage(val.loss_percentage);
            setOptionId(val.id);
          } else if (val.option === "BANKNIFTY PE") {
            setPutPcr_put(val.set_pcr);
            setBasePlus_put(val.baseprice_plus);
            setProfitPercentage_put(val.profit_percentage);
            setLossPercentage_put(val.loss_percentage);
            setOptionId_put(val.id);
          } else if (val.option === "BANKNIFTY FUTURE") {
            setFutureProfit(val.profit_percentage)
            setFutureLoss(val.loss_percentage)
          }
          return val;
        });
        setOpFut(data?.liveSettings[0]);
      }).catch(e => {
        console.log(e);
      })

    await fetch(nse_api)
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.length === 0) {
          json.data = [{ percentage: { option: "" }, status: "" }];
        }
        for (var i of json.data) {
          if (
            i.percentage.option === "BANKNIFTY CE" &&
            i.status === "BUY" &&
            i.call_put === "CALL"
          ) {
            setBuyCondition(false);
            break;
          } else {
            setBuyCondition(true);
          }
        }
        for (var i of json.data) {
          if (
            i.percentage.option === "BANKNIFTY PE" &&
            i.status === "BUY" &&
            i.call_put === "PUT"
          ) {
            setBuyputCondition(false);
            break;
          } else {
            setBuyputCondition(true);
          }
        }

        var date = moment();
        var currentDate = date.format("D/MM/YYYY");
        let profit = 0;
        let loss = 0;
        for (var j of json.data) {
          var Buy_Date = moment(j.buy_time).format("D/MM/YYYY");
          if (
            Buy_Date === currentDate &&
            j.percentage.option === "BANKNIFTY CE"
          ) {
            if (j.final_status === "PROFIT") {
              profit = profit + 1;
            } else if (j.final_status === "LOSS") {
              loss = loss + 1;
            }
          }
        }
        if (profit > loss) {
          setOneStock(false);
        } else {
          setOneStock(true);
        }

        var date = moment();
        var currentDate = date.format("D/MM/YYYY");
        let profit1 = 0;
        let loss1 = 0;
        for (var j of json.data) {
          var Buy_Date = moment(j.buy_time).format("D/MM/YYYY");
          if (
            Buy_Date === currentDate &&
            j.percentage.option === "BANKNIFTY PE"
          ) {
            if (j.final_status === "PROFIT") {
              profit1 = profit1 + 1;
            } else if (j.final_status === "LOSS") {
              loss1 = loss1 + 1;
            }
          }
        }
        if (profit1 > loss1) {
          setOneStock_put(false);
        } else {
          setOneStock_put(true);
        }

        json.data.map((val) => {
          setJugad(2 + 1);
          if (
            val.status === "BUY" &&
            val.percentage.option === "BANKNIFTY CE" &&
            val.call_put === "CALL"
          ) {
            let sell_Price =
              (val.buy_price * val.percentage.profit_percentage) / 100 +
              val.buy_price;

            let stop_Loss =
              val.buy_price -
              (val.buy_price * val.percentage.loss_percentage) / 100;

            if (filteredData.length !== 0) {
              let BuyLivePrice = [];
              let strikePrice = val.base_strike_price;
              filteredData.map((value) => {
                if (value.strikePrice === strikePrice) {
                  if (val.call_put === "CALL") {
                    let buuybidprice = value.CE.bidprice;
                    BuyLivePrice.push(buuybidprice);
                    sellBidPrice(buuybidprice);
                  }
                }
              });

              if (val.admin_call === true) {
                val.buy_price < BuyLivePrice
                  ? setFinalStatus("PROFIT")
                  : setFinalStatus("LOSS");

                setLocalDataId(val.id);
                setSellFunCall(true);
              }

              console.log(
                "buy_price:",
                val.buy_price,
                "sell_Price:",
                sell_Price,
                "liveBidPrice:",
                BuyLivePrice,
                "stop_Loss:",
                stop_Loss
              );
              if (sell_Price <= BuyLivePrice) {
                setFinalStatus("PROFIT");
                setLocalDataId(val.id);
                setSellFunCall(true);
              }
              if (stop_Loss >= BuyLivePrice) {
                setFinalStatus("LOSS");
                setLocalDataId(val.id);
                setSellFunCall(true);
              }
            }
          }

          if (
            val.status === "BUY" &&
            val.percentage.option === "BANKNIFTY PE" &&
            val.call_put === "PUT"
          ) {
            let sell_Price =
              (val.buy_price * val.percentage.profit_percentage) / 100 +
              val.buy_price;
            let stop_Loss =
              val.buy_price -
              (val.buy_price * val.percentage.loss_percentage) / 100;

            if (filteredData.length !== 0) {
              let BuyLivePrice_put = [];
              let strikePrice = val.base_strike_price;
              filteredData.map((value) => {
                if (value.strikePrice === strikePrice) {
                  if (val.call_put === "PUT") {
                    let buuybidprice_put = value.PE.bidprice;
                    BuyLivePrice_put.push(buuybidprice_put);
                    setSellBidPrice_put(buuybidprice_put);
                  }
                }
              });

              if (val.admin_call === true) {
                val.buy_price < BuyLivePrice_put
                  ? setFinalStatus_put("PROFIT")
                  : setFinalStatus_put("LOSS");
                setLocalDataId_put(val.id);
                setSellFunPut(true);
              }

              console.log(
                "buy_price:",
                val.buy_price,
                "sell_Price:",
                sell_Price,
                "liveBidPrice:",
                BuyLivePrice_put,
                "stop_Loss:",
                stop_Loss
              );
              if (sell_Price <= BuyLivePrice_put) {
                setFinalStatus_put("PROFIT");
                setLocalDataId_put(val.id);
                setSellFunPut(true);
              }
              if (stop_Loss >= BuyLivePrice_put) {
                setFinalStatus_put("LOSS");
                setLocalDataId_put(val.id);
                setSellFunPut(true);
              }
            }
            // }
          }
        });
      })
      .catch((e) => console.log(e));
  };


  const mainBuyConditionFun = () => {
    if (oneStock === true && buyCondition === true) {
      const Buy_Price = [];
      peMax.map((ab) => {
        if (peMax !== ceMax && cepeDiffrent >= 50000) {
          if (pcrValue >= callPcr) {
            let basePricePlus = ab.strikePrice + basePlus;
            let base_a = basePricePlus - 10;

            if (base_a <= liveprice && liveprice <= basePricePlus) {
              let a = 0;
              while (buyPrice.length === 0 && a === 0) {
                Buy_Price.push(ab);
                setBuyPrice([...buyPrice, ab]);
                setCAll("CALL");
                a = 1;
              }
            }
          }
        }
        return ab;
      });
    }
  };

  const mainBuyConditionFunput = () => {
    if (oneStock_put === true && buyConditionput === true) {
      peMax.map((ab) => {
        if (peMax !== ceMax && cepeDiffrent >= 50000) {
          if (pcrValue <= putPcr_put) {
            let basePricePlus = ab.strikePrice + basePlus_put;
            let base_a = basePricePlus - 10;

            if (base_a <= liveprice_put && liveprice_put <= basePricePlus) {
              let a = 0;
              while (buyputPrice.length === 0 && a === 0) {
                setBuyputPrice([...buyputPrice, ab]);
                setPut("PUT");
                a = 1;
              }
            }
          }
        }
        return ab;
      });
    }
  };

  const conditionFunction = () => {

    if (jugad !== 10) {
      if (oneStock === false && buyCondition === true) {
        console.log("YOU HAVE MAKE PROFIT TODAY IN BANKNIFTY CE");
        setOneStock(true);
      } else {
        buyCondition === true
          ? console.log(
            "YOU CAN BUYYYY",
            "cepeDiffrent:",
            cepeDiffrent,
            "pcrValue:",
            pcrValue,
            "buyPrice:",
            buyPrice
          )
          : console.log("Cannot BUY You Have Stock in DB");

        if (buyPrice.length !== 0) {
          if (buyCondition === true) {
            buyPrice.map((ab) => {
              if (call === "CALL") {
                let bdprice = ab.CE.bidprice;
                setBidPrice(bdprice);
                let squareoff = (bdprice * profitPercentage) / 100;
                let stoploss = (bdprice * lossPercentage) / 100;
                let sell_price = (bdprice * profitPercentage) / 100 + bdprice;
                let stop_loss = bdprice - (bdprice * lossPercentage) / 100;
                let sell_price_float = sell_price.toFixed(1);
                let stop_loss_float = stop_loss.toFixed(1);
                setSquareoff_call(squareoff);
                setStoploss_call(stoploss);
                setSellPrice(sell_price_float);
                setStopLoss(stop_loss_float);
              }
              let stprice = ab.strikePrice;
              setStrikePrice(stprice);
            });
          }
        }
      }
    }

    if (jugad !== 10) {
      if (oneStock_put === false && buyConditionput === true) {
        console.log("YOU HAVE MAKE PROFIT TODAY IN  PE");
        setOneStock_put(true);
      } else {
        buyConditionput === true
          ? console.log(
            "YOU CAN BUYYYY",
            "cepeDiffrent:",
            cepeDiffrent,
            "pcrValue:",
            pcrValue,
            "buyPrice:",
            buyPrice
          )
          : console.log("Cannot BUY You Have Stock in DB");

        if (buyputPrice.length !== 0) {
          if (buyConditionput === true) {
            buyputPrice.map((ab) => {
              if (put === "PUT") {
                let bdprice = ab.PE.bidprice;
                setBidPrice_put(bdprice);
                let squareoff = (bdprice * profitPercentage) / 100;
                let stoploss = (bdprice * lossPercentage) / 100;
                let sell_price =
                  (bdprice * profitPercentage_put) / 100 + bdprice;
                let stop_loss = bdprice - (bdprice * lossPercentage_put) / 100;
                let sell_price_float = sell_price.toFixed(1);
                let stop_loss_float = stop_loss.toFixed(1);
                setSquareoff_put(squareoff);
                setStoploss_put(stoploss);
                setSellPrice_put(sell_price_float);
                setStopLoss_put(stop_loss_float);
              }
              let stprice = ab.strikePrice;
              setStrikePrice_put(stprice);
            });
          }
        }
      }
    }
  };

  const postData = async () => {
    try {
      const article = {
        buy_price: bidPrice,
        base_strike_price: strikePrice,
        live_Strike_price: liveprice,
        live_brid_price: liveBidPrice,
        sell_price: sellPrice,
        stop_loseprice: stopLoss,
        percentage: optionId,
        call_put: call,
        squareoff: sp,
        stoploss: sl,
      };

      await axios({
        method: "post",
        url: nse_api,
        mode: "cors",
        data: article,
      }).then((response) => {
        console.log(response.data);
        setCAll("");
      });
    } catch (err) {
      console.log("Error", err.response);
    }
  };

  const postData_put = async () => {
    try {
      const article = {
        buy_price: bidPrice_put,
        base_strike_price: strikePrice_put,
        live_Strike_price: liveprice_put,
        live_brid_price: liveBidPrice_put,
        sell_price: sellPrice_put,
        stop_loseprice: stopLoss_put,
        percentage: optionId_put,
        call_put: put,
        squareoff: sw,
        stoploss: sd,
      };

      await axios({
        method: "post",
        url: nse_api,
        mode: "cors",
        data: article,
      }).then((response) => {
        console.log(response.data);
        setPut("");
      });
    } catch (err) {
      console.log("Error", err.response);
    }
  };

  const sellData = async () => {
    try {
      const article = {
        id: localDataId,
        exit_price: sellbidPrice,
        live_brid_price: sellbidPrice,
        shell_strike_price: liveprice,
        sell_buy_time: timestamp,
        final_status: finalStatus,

        admin_call: true,
      };

      await axios({
        method: "put",
        url: nse_api,
        data: article,
      }).then((response) => {
        setSellFunCall(false);
        setBuyPrice([]);
        setBidPrice([]);
        setStrikePrice([]);
        setLiveprice([]);
        setLiveBidprice([]);
        setSellPrice([]);
        setStopLoss([]);
        setStoploss_call([]);
        setSquareoff_call([]);
        setFinalStatus("NA");
      });
    } catch (err) {
      console.log("Error ", err.response);
    }
  };

  const sellData_put = async () => {
    try {
      const article = {
        id: localDataId_put,
        exit_price: sellbidPrice_put,
        live_brid_price: sellbidPrice_put,
        shell_strike_price: liveprice_put,
        sell_buy_time: timestamp,
        final_status: finalStatus_put,
        admin_call: true,
      };

      await axios({
        method: "put",
        url: nse_api,
        data: article,
      }).then((response) => {
        setSellFunPut(false);
        setBuyputPrice([]);
        setBidPrice_put([]);
        setStrikePrice_put([]);
        setLiveprice_put([]);
        setLiveBidprice_put([]);
        setSellPrice_put([]);
        setStopLoss_put([]);
        setSquareoff_put([]);
        setStoploss_put([]);
        setFinalStatus_put("NA");
      });
    } catch (err) {
      console.log("Error ", err.response);
    }
  };


  const opFutUpdateHandle = (value) => {
    if (value === 'OPTION' || value === 'NA') {
      let data = {
        id: 1,
        op_fut_banknifty: 'FUTURE',
      };
      axios({
        method: "put",
        url: live_put,
        data: data,
      }).then((response) => {
        setOpFut(response.data.data);
      });
    } else if (value === 'FUTURE') {
      let data = {
        id: 1,
        op_fut_banknifty: 'OPTION',
      };
      axios({
        method: "put",
        url: live_put,
        data: data,
      }).then((response) => {
        setOpFut(response.data.data);
      });
    }
  }

  const buyFutureHandle = async (type) => {
    const lot = prompt(`BANKNIFTY FUTURE ${type} with ${FutureProfit} profit and ${FutureLoss} loss \nPlease enter lots!`)

    if (lot !== null && lot !== '') {
      type === 'BUY' ? setButtonLoading(true) : setButtonLoadingSell(true)
      await axios({
        method: "POST",
        url: LOCAL_STOCK_API_URL + '/buyFutureOp',
        data: { 
          "OPTION": 'BANKNIFTY',
          'type': type, 
          'lots': parseInt(lot), 
          'profit': FutureProfit, 
          'loss': FutureLoss,
          'is_live': opFut.live_banknifty 
        },
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
      <NavbarMenu />

      <div className="container">
        <div
          className="row"
          style={{ marginTop: "10px" }}
        >
          <div className="col-md-6 p-2 bg-success text-white float-left">
            Underlying Index:
            <span id="equity_underlyingVal" className="bold ">
              <b> BANKNIFTY {liveprice} </b>
            </span>
            <span id="equity_timeStamp" className="asondate">
              As on {timestamp} IST
            </span>
          </div>

          <div className="col-md-5 float-left" style={{ float: "left" }}>
            {opFut?.op_fut_banknifty &&
              <>
                <label style={{marginLeft: "-35px"}}>Current Buying: </label><Button onClick={e => opFutUpdateHandle(opFut.op_fut_banknifty)} style={{ backgroundColor: opFut.live_banknifty === true ? "#72ED90 " : "white", }}>{opFut.op_fut_banknifty}</Button>
                <label style={{ marginLeft: "15px" }}>Future: </label>
                <Button loading={loadingButton} onClick={()=> {buyFutureHandle('BUY')}} style={{ backgroundColor: "#008F75", color: "white",  marginRight: "6px" }}>BUY</Button>
                <Button loading={loadingButtonSell} onClick={()=> {buyFutureHandle('SELL')}} style={{ backgroundColor: "#D64D4D", color: "white" }}>SELL</Button>
              </>
            }
          </div>

          <div className="col-md-1 d-inline p-2 bg-success text-white float-right">
            PCR = {Number(pcrValue).toFixed(2)}
          </div>
        </div>
      </div>

      <div id="chartContainer">
        <Spin size="large" style={{ marginTop: "70px" }} spinning={loading}>
          <Table className="mt-3" id="chartContainer">
            <thead
            // style={{ position: 'sticky', top : '0' }}
            >
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
                      {data?.PE?.openInterest +
                        data?.PE?.changeinOpenInterest -
                        (data?.CE?.openInterest +
                          data?.CE?.changeinOpenInterest)}

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
                      {data?.CE?.openInterest + data?.CE?.changeinOpenInterest}{" "}
                      (
                      {data?.PE?.changeinOpenInterest < 0
                        ? data?.PE?.changeinOpenInterest
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
                      {+(
                        data?.PE?.openInterest + data?.PE?.changeinOpenInterest
                      ) -
                        (data?.CE?.openInterest +
                          data?.CE?.changeinOpenInterest)}

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
                      {data?.PE?.changeinOpenInterest + data?.PE?.openInterest}{" "}
                      (
                      {data?.PE?.changeinOpenInterest < 0
                        ? data?.PE?.changeinOpenInterest
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
                      {data?.CE?.openInterest + data?.CE?.changeinOpenInterest}
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

export default AdminBankNifty;
