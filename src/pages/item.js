import React, { useEffect, useState } from "react";
import NavbarMenu from "../components/Navbar";

import Table from "react-bootstrap/Table";

import { Select, MenuItem, InputLabel, FormControl } from "@material-ui/core";
import { Spin } from "antd";
import axios from "axios";

function Item() {
  const [loading, setLoading] = useState(true);

  const [getdata, setOi] = useState([]);
  const [expiryDate, setExpriy_date] = useState([]);
  const [spot, setSpot] = useState([]);
  const [live, setlive] = useState([]);
  const [d2, setD2] = useState([]);
  const [pcrValue, setPcrValue] = useState([]);
  const [selectense, setNse] = useState("NIFTY");

  useEffect(() => {
    document.title = "Items";
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectense]);

  async function fetchData() {
    await axios
      .get(
        "https://www.nseindia.com/api/option-chain-indices?symbol=" +
          `${selectense}`
      )

      .then((json) => {
        let q = json.data.records.underlyingValue;
        setD2(q);

        let expriy_date = json.data.records.expiryDates;
        setExpriy_date(expriy_date);
        setOi(json.data.records.data);
        setSpot(json.data.records.timestamp);
        const sum = json.data.filtered.CE.totOI;
        const sum2 = json.data.filtered.PE.totOI;
        const PCR = sum2 / sum;
        setPcrValue(PCR);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const [selectedExpiry, setValue] = useState(expiryDate[0]);

  let keys = getdata.filter(
    (data) =>
      data.expiryDate === (selectedExpiry ? selectedExpiry : expiryDate[0])
  );

  let kam = keys.filter((data) => {
    if (data.strikePrice >= d2) {
      return data;
    }
  });

  let kam_2 = keys.filter((data) => {
    if (data.strikePrice <= d2) {
      return data;
    }
  });

  let pe = kam_2.slice(-5).map((val) => {
    let ss = val.PE.openInterest + val.PE.changeinOpenInterest;
    return ss;
  });

  let compare = (a, b) => {
    return b - a;
  };

  const numAscending = pe.sort(compare);
  const num = numAscending.slice(0, 1);
  // < ------------------------------------------------>
  let CE_PE_SUM = kam.slice(0, 5).map((val) => {
    var ss = val.CE.openInterest + val.CE.changeinOpenInterest;
    return ss;
  });

  let compare1 = (a, b) => {
    return b - a;
  };

  const numAscending1 = CE_PE_SUM.sort(compare1);
  const num1 = numAscending1.slice(0, 1);

  let pemax = kam_2.filter((ab) => {
    let r = ab?.PE?.changeinOpenInterest + ab?.PE?.openInterest;
    if (r === num[0]) {
      return ab;
    }
  });

  let cemax = kam.filter((ab) => {
    let r = ab?.CE?.changeinOpenInterest + ab?.CE?.openInterest;
    if (r === num1[0]) {
      return ab;
    }
  });

  const handleChange = (e) => {
    setValue(e.target.value);
    e.preventDefault();
  };

  const handleChang_nifty_banknifty = (e) => {
    setNse(e.target.value);
  };
  return (
    <>
      <NavbarMenu />
      <div className="container">
        <div
          class="row justify-content-between"
          style={{ marginTop: "10px", alignItems: "center" }}
        >
          <div className="col-6 d-inline p-2 bg-success text-white float-left">
            Underlying Index:
            <span id="equity_underlyingVal" className="bold ">
              <b>
                {" "}
                {selectense} {d2}{" "}
              </b>
            </span>
            <span id="equity_timeStamp" className="asondate">
              As on {spot} IST
            </span>
          </div>

          <div className="col-4 d-inline p-2">
            <FormControl style={{ width: "150px" }}>
              <InputLabel id="demo-simple-select-label">SELECT</InputLabel>
              <Select
                onChange={handleChang_nifty_banknifty}
                id="NIFTY"
                value={selectense ?? ""}
              >
                <MenuItem value="NIFTY">NIFTY</MenuItem>
                <MenuItem value="BANKNIFTY">BANKNIFTY</MenuItem>
              </Select>
            </FormControl>

            <FormControl style={{ width: "200px", marginLeft: "14px" }}>
              <InputLabel id="demo-simple-select-label">
                SELECT EXPRIY
              </InputLabel>
              <Select
                onChange={handleChange}
                id={expiryDate[0]}
                value={selectedExpiry ?? ""}
              >
                <MenuItem value={expiryDate[0]}>
                  <em>Select Expriy</em>
                </MenuItem>
                <MenuItem key={expiryDate[0]} value={expiryDate[0]}>
                  {expiryDate[0]}
                </MenuItem>
                <MenuItem key={expiryDate[1]} value={expiryDate[1]}>
                  {expiryDate[1]}
                </MenuItem>
                <MenuItem key={expiryDate[2]} value={expiryDate[2]}>
                  {expiryDate[2]}
                </MenuItem>
                <MenuItem key={expiryDate[3]} value={expiryDate[3]}>
                  {expiryDate[3]}
                </MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="col-1 d-inline p-2 bg-success text-white float-right">
            PCR = {Number(pcrValue).toFixed(2)}
          </div>
        </div>
      </div>

      <div>
        <Spin size="large" spinning={loading}>
          <Table size="sm">
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
              </tr>
            </thead>
            <tbody>
              {kam_2 &&
                kam_2.slice(-10).map((data, i) => {
                  if ({ live })
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
                        </td>
                        <td
                          style={{
                            backgroundColor:
                              pemax[0] === data ? "#ff1000" : null,
                          }}
                        >
                          {data?.PE?.openInterest +
                            data?.PE?.changeinOpenInterest}
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
                          {data?.CE?.openInterest +
                            data?.CE?.changeinOpenInterest}{" "}
                          (
                          {data?.PE?.changeinOpenInterest < 0
                            ? data?.PE?.changeinOpenInterest
                            : null}
                          )
                        </td>
                      </tr>
                    );
                })}
              {kam &&
                kam.slice(0, 10).map((data, i) => {
                  if ({ live })
                    return (
                      <tr key={i}>
                        <td
                          style={{
                            backgroundColor: "#ECF0F1 ",
                          }}
                        >
                          {+(
                            data?.PE?.openInterest +
                            data?.PE?.changeinOpenInterest
                          ) -
                            (data?.CE?.openInterest +
                              data?.CE?.changeinOpenInterest)}
                        </td>
                        <td
                          style={{
                            backgroundColor: "#33F9FF",
                          }}
                        >
                          {data?.PE?.changeinOpenInterest +
                            data?.PE?.openInterest}{" "}
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
                            backgroundColor:
                              cemax[0] === data ? "#ff1000" : null,
                          }}
                        >
                          {data.CE.openInterest + data.CE.changeinOpenInterest}
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
}

export default Item;
