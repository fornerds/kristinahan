// src/api/api.js
import axios from "axios";
import qs from "qs";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Request 인터셉터
api.interceptors.request.use(
  (config) => {
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // 토큰이 만료되었음을 사용자에게 알립니다.
      alert("토큰이 만료되었습니다. 다시 로그인해주세요.");
      try {
        // 여기서 토큰을 갱신하는 로직을 구현해야 합니다.
        // 예: const newToken = await refreshToken();
        // localStorage.setItem('token', newToken);
        // originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        localStorage.removeItem("adminToken");
        // 로그인 페이지로 리다이렉트
        window.location.href = "/admin/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// 인증 관련
export const login = (id, password) =>
  api.post("/login", qs.stringify({ id, password }), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
export const adminLogin = (id, password) =>
  api.post("/admin/login", qs.stringify({ id, password }), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
export const changePassword = (userId, oldPassword, newPassword, token) =>
  api.put(`/user/change-password?user_id=${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    old_password: oldPassword,
    new_password: newPassword,
  });
export const changeAdminPassword = (oldPassword, newPassword) =>
  api.put("/admin/change-password", {
    old_password: oldPassword,
    new_password: newPassword,
  });

// 이벤트 관련
export const getCurrentEvents = () => api.get("/event/current");
export const getEventDetails = (eventId) => api.get(`/event/${eventId}`);
export const updateEvent = (eventId, eventData) =>
  api.put(`/event/${eventId}`, eventData);
export const deleteEvent = (eventId) => api.delete(`/event/${eventId}`);
export const getAllEvents = () => api.get("/events");
export const createEvent = (eventData) => api.post("/event", eventData);
export const updateEventProgress = (eventId, inProgress) =>
  api.put(`/event/${eventId}/${inProgress}`);

// 주문서 관련
export const getOrders = (params) => {
  // 빈 문자열인 파라미터 제거
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
export const updateOrderStatus = (orderId, status) =>
  api.put(`/orders/${orderId}/${status}`);
export const saveOrder = (orderData, isUpdate = false, isTemp = false) =>
  isUpdate
    ? api.put("/order/save", orderData, { params: { is_temp: isTemp } })
    : api.post("/order/save", orderData, { params: { is_temp: isTemp } });
export const saveTempOrder = (orderData, isUpdate = false) =>
  isUpdate
    ? api.put("/temp/order/save", orderData)
    : api.post("/temp/order/save", orderData);
export const downloadOrders = (params) =>
  api.get("/orders/download", { params, responseType: "blob" });

// 작성자 관련
export const getAuthors = () => api.get("/authors");
export const createAuthor = (authorData) => api.post("/authors", authorData);
export const updateAuthor = (authorId, authorData) =>
  api.put(`/authors/${authorId}`, { name: authorData });
export const deleteAuthor = (authorId) => api.delete(`/authors/${authorId}`);

// 소속 관련
export const getAffiliations = () => api.get("/affiliations");
export const createAffiliation = (affiliationData) =>
  api.post("/affiliations", affiliationData);
export const updateAffiliation = (affiliationId, affiliationData) =>
  api.put(`/affiliations/${affiliationId}`, { name: affiliationData });
export const deleteAffiliation = (affiliationId) =>
  api.delete(`/affiliations/${affiliationId}`);

// 카테고리 관련
export const getCategories = () => api.get("/categories");
export const createCategory = (categoryData) =>
  api.post("/categories", categoryData);
export const getCategoryDetails = (categoryId) =>
  api.get(`/categories/${categoryId}`);
export const updateCategory = (categoryId, categoryData) =>
  api.put(`/categories/${categoryId}`, categoryData);
export const deleteCategory = (categoryId) =>
  api.delete(`/categories/${categoryId}`);

// 주문서 양식 관련
export const getForms = () => api.get("/forms");
export const createForm = (formData) => api.post("/forms", formData);
export const getFormDetails = (formId) => api.get(`/forms/${formId}`);
export const updateForm = (formId, formData) =>
  api.put(`/forms/${formId}`, formData);
export const deleteForm = (formId) => api.delete(`/forms/${formId}`);
export const duplicateForm = (formId) => api.post(`/forms/${formId}/duplicate`);
