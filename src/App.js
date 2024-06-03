import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import BankNifty from "./pages/BankNifty";
import Home from "./pages/Home";
import Nifty from "./pages/Nifty";
import Login from "./admin/Login";
import LiveNse from "./admin/LiveNse";
import HistoryData from "./admin/HistoryNse";
import PrivateRoutes from "./services/PrivateRoutes";
import SettingsNse from "./admin/SettingsNse";
import AccountDetails from "./admin/AccountDetails";
import PcrValues from "./pages/PcrValues";
import Item from "./pages/item";
import ChangePasswordForm from "./admin/forgetpassword";
import AdminBankNifty from "./pages/AdminBankNifty";
import AdminNifty from "./pages/AdminNifty";
import Users from "./admin/Users";
import Eror404 from "./pages/Eror404";
import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [updateNifty, setUpdateNifty] = useState([]);
  const [updateStock, setUpdateStock] = useState([]);

  const updateNiftyData = () => {
    axios
      .get("http://192.168.1.116/shareMarket/index.php/api/niftyJsonUpdate")
      .then((res) => setUpdateNifty(res.data))
      .catch((err) => console.log(err));
  };

  const updateStockData = () => {
    axios
      .get("http://192.168.1.116/shareMarket/index.php/api/stokListUpdate")
      .then((res) => setUpdateStock(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    updateNiftyData();
    updateStockData();
    const interval = setInterval(() => {
      updateNiftyData();
      updateStockData();
    }, 180000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <div>
        <Router>
          <Routes>
            <Route element={<PrivateRoutes />}>
              <Route exact path="/" element={<Home />} />
              <Route path="/item" element={<Item />} />
              <Route path="/bank-nifty" element={<BankNifty />} />
              <Route path="/admin-bank-nifty" element={<AdminBankNifty />} />
              <Route path="/admin-nifty-50" element={<AdminNifty />} />
              <Route path="/nifty-50" element={<Nifty />} />
              <Route path="/pcr" element={<PcrValues />} />
            </Route>

            <Route element={<PrivateRoutes />}>
              <Route path="/admin-live" element={<LiveNse />} />
              <Route path="/admin-history" element={<HistoryData />} />
              <Route path="/admin-settings" element={<SettingsNse />} />
              <Route
                path="/admin-accountdetails"
                element={<AccountDetails />}
              />
              <Route path="/admin-users" element={<Users />} />
              <Route path="/reset-password" element={<ChangePasswordForm />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Eror404 />} />
          </Routes>
        </Router>
        <ToastContainer autoClose={2000} />
      </div>
    </div>
  );
}

export default App;
