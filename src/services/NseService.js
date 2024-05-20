import call from "./CommonService";

/*
 * Get NSE Details
 */
const getNse = async (page) => {
  let apiCall = await call({
    path: `/stocks?page=${page}`,
    method: "get",
  });
  return apiCall;
};

const getLiveStocks = async (page) => {
  let apiCall = await call({
    path: `/liveStocks?page=${page}`,
    method: "get",
  });
  return apiCall;
};

const setting_get = async () => {
  let apiCall = await call({
    path: "/settings",
    method: "get",
  });

  return apiCall;
};

const getUsers = async () => {
  let apiCall = await call({
    path: "/users",
    method: "GET",
  });

  return apiCall;
};

const updateUsers = async (data, id) => {
  let apiCall = await call({
    path: "/users",
    method: "PUT",
    data
  });

  return apiCall;
};

const deleteUser = async (id) => {
  let apiCall = await call({
    path: "/users/" + id,
    method: "DELETE",
  });

  return apiCall;
};

const accountdetails_get = async () => {
  let apiCall = await call({
    path: "/accountDetail",
    method: "get",
  });

  return apiCall;
};

const accountdetailById = async (id) => {
  let apiCall = await call({
    path: "/accountDetail/" + id,
    method: "get",
  });

  return apiCall;
};

const updateAccountdetail = async (data, id) => {
  let apiCall = await call({
    path: "/accountDetail/" + id,
    method: "PUT",
    data,
  });

  return apiCall;
};

export default {
  getNse,
  setting_get,
  accountdetails_get,
  accountdetailById,
  updateAccountdetail,
  getLiveStocks,
  getUsers,
  updateUsers,
  deleteUser
};
