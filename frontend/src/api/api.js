import axios from "axios";
import qs from "qs";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Request 인터셉터
api.interceptors.request.use(
  (config) => {
    // Content-Type이 설정되어 있는지 확인
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      alert("토큰이 만료되었습니다. 다시 로그인해주세요.");
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

// 인증 API
export const login = (loginData) => {
  const formData = new URLSearchParams();
  formData.append("id", loginData.id);
  formData.append("password", loginData.password);

  return api.post("/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

export const adminLogin = (loginData) => {
  // FormData로 변환
  const formData = new URLSearchParams();
  formData.append("id", loginData.id);
  formData.append("password", loginData.password);

  return api.post("/admin/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

export const changeUserPassword = (userId, oldPassword, newPassword) => {
  return api.put(
    `/user/change-password`,
    {
      old_password: oldPassword,
      new_password: newPassword,
    },
    {
      params: {
        user_id: userId,
      },
    }
  );
};

export const changeAdminPassword = (oldPassword, newPassword) => {
  return api.put("/admin/change-password", {
    old_password: oldPassword,
    new_password: newPassword,
  });
};

// 이벤트 API
export const getCurrentEvents = () => api.get("/event/current");

export const getEventDetails = (eventId) => api.get(`/event/${eventId}`);

export const getAllEvents = () => api.get("/events");

export const createEvent = (eventData) => api.post("/event", eventData);

export const updateEvent = (eventId, eventData) =>
  api.put(`/event/${eventId}`, eventData);

export const deleteEvent = (eventId) => api.delete(`/event/${eventId}`);

export const updateEventProgress = (eventId, inProgress) =>
  api.put(`/event/${eventId}/${inProgress}`);

// 주문서 API
export const getOrders = (params) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value != null) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return api.get("/orders", {
    params: cleanParams,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "repeat" });
    },
  });
};

export const getOrderDetails = (orderId) => api.get(`/order/${orderId}`);

export const saveOrder = (orderData, orderId = null, isTemp = false) => {
  const endpoint = orderId ? `/order/save/${orderId}` : "/order/save";
  const method = orderId ? "put" : "post";

  return api[method](endpoint, orderData, {
    params: { is_temp: isTemp },
  });
};

export const updateOrderStatus = (orderId, status) =>
  api.put(`/orders/${orderId}/${status}`);

export const downloadOrders = (params) =>
  api.get("/orders/download", {
    params,
    responseType: "blob",
  });

// 작성자 API
export const getAuthors = () => api.get("/authors");

export const createAuthor = (authorData) => api.post("/authors", authorData);

export const updateAuthor = (authorId, authorData) =>
  api.put(`/authors/${authorId}`, authorData);

export const deleteAuthor = (authorId) => api.delete(`/authors/${authorId}`);

// 소속 API
export const getAffiliations = () => api.get("/affiliations");

export const createAffiliation = (affiliationData) =>
  api.post("/affiliations", affiliationData);

export const updateAffiliation = (affiliationId, affiliationData) =>
  api.put(`/affiliations/${affiliationId}`, affiliationData);

export const deleteAffiliation = (affiliationId) =>
  api.delete(`/affiliations/${affiliationId}`);

// 카테고리 API
export const getCategories = () => api.get("/categories");

export const getCategoryDetails = (categoryId) =>
  api.get(`/categories/${categoryId}`);

export const createCategory = (categoryData) =>
  api.post("/categories", categoryData);

export const updateCategory = (categoryId, categoryData) =>
  api.put(`/categories/${categoryId}`, categoryData);

export const deleteCategory = (categoryId) =>
  api.delete(`/categories/${categoryId}`);

// 주문서 양식 API
export const getForms = () => api.get("/forms");

export const getFormDetails = (formId) => api.get(`/forms/${formId}`);

export const createForm = (formData) => api.post("/forms", formData);

export const updateForm = (formId, formData) =>
  api.put(`/forms/${formId}`, formData);

export const deleteForm = (formId) => api.delete(`/forms/${formId}`);

export const duplicateForm = (formId) => api.post(`/forms/${formId}/duplicate`);

// Rates API
export const getGoldPriceInfo = (params) =>
  api.get("/getGoldPriceInfo", { params });

export const getExchangeRateInfo = (params) =>
  api.get("/getExchangeRateInfo", { params });
