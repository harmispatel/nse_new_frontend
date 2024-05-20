import call from "./CommonService";


const login = async (data) => {
  let apiCall = await call({
    path: "/api/login/",
    method: "post",
    data,
  });
  return apiCall;
};


const registerUser = async (data) => {
  let apiCall = await call({
    path: "/api/register/",
    method: "POST",
    data,
  });

  return apiCall;
};

const logout_user = async (data) => {
  let apiCall = await call({
    path: "/api/logout/",
    method: "post",
    data,
  });

  return apiCall;
};

export default {
  login,
  logout_user,
  registerUser
};
