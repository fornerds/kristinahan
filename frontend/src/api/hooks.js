// src/api/hooks.js
import { useQuery, useMutation, useQueryClient } from "react-query";
import * as api from "./api";

// 에러 처리 유틸리티 함수
const handleApiError = (error) => {
  if (error.response && error.response.status === 401) {
    // 401 에러 처리
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  }
  // 다른 에러 처리...
};

// 인증 관련 hooks
export const useLogin = () => {
  return useMutation(({ id, password }) => api.login(id, password));
};

export const useAdminLogin = () => {
  return useMutation(({ id, password }) => api.adminLogin(id, password));
};

export const useChangePassword = () => {
  return useMutation(
    ({ oldPassword, newPassword }) => {
      const token = localStorage.getItem("adminToken"); // 관리자 토큰을 로컬 스토리지에서 가져옵니다.
      const userId = 1;
      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }
      return api.changePassword(userId, oldPassword, newPassword, token);
    },
    {
      onError: (error) => {
        console.error("Password change error:", error);
        if (error.response && error.response.status === 401) {
          // 401 Unauthorized 에러 처리
          localStorage.removeItem("adminToken");
          window.location.href = "/admin/login";
        } else {
          // 다른 에러 처리
          alert(
            error.response?.data?.detail ||
              "비밀번호 변경에 실패했습니다. 다시 시도해주세요."
          );
        }
      },
    }
  );
};

export const useChangeAdminPassword = () => {
  return useMutation(
    ({ oldPassword, newPassword }) =>
      api.changeAdminPassword(oldPassword, newPassword),
    {
      onError: (error) => {
        handleApiError(error);
      },
    }
  );
};

// 이벤트 관련 hooks
export const useCurrentEvents = () => {
  return useQuery("currentEvents", api.getCurrentEvents);
};

export const useEventDetails = (eventId) => {
  return useQuery(["event", eventId], () => api.getEventDetails(eventId), {
    enabled: !!eventId,
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ eventId, eventData }) => api.updateEvent(eventId, eventData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("currentEvents");
        queryClient.invalidateQueries("allEvents");
      },
    }
  );
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation(api.deleteEvent, {
    onSuccess: () => {
      queryClient.invalidateQueries("currentEvents");
      queryClient.invalidateQueries("allEvents");
    },
  });
};

export const useAllEvents = () => {
  return useQuery("allEvents", api.getAllEvents);
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation(api.createEvent, {
    onSuccess: () => {
      queryClient.invalidateQueries("currentEvents");
      queryClient.invalidateQueries("allEvents");
    },
  });
};

export const useUpdateEventProgress = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ eventId, inProgress }) => api.updateEventProgress(eventId, inProgress),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("currentEvents");
        queryClient.invalidateQueries("allEvents");
      },
    }
  );
};

// 주문서 관련 hooks
export const useOrders = (params) => {
  return useQuery(["orders", params], () => api.getOrders(params), {
    keepPreviousData: true,
  });
};

export const useOrderDetails = (orderId) => {
  return useQuery(["order", orderId], () => api.getOrderDetails(orderId), {
    enabled: !!orderId,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ orderId, status }) => api.updateOrderStatus(orderId, status),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData(["order", variables.orderId], (oldData) => ({
          ...oldData,
          status: variables.status,
        }));
        queryClient.invalidateQueries("orders");
      },
    }
  );
};

export const useSaveOrder = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ orderData, orderId, isTemp }) =>
      api.saveOrder(orderData, orderId, isTemp),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("orders");
      },
    }
  );
};

export const useSaveTempOrder = () => {
  return useMutation(({ orderData, orderId }) =>
    api.saveOrder(orderData, orderId, true)
  );
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ orderId, orderData, isTemp }) =>
      api.saveOrder(orderData, orderId, isTemp),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries("orders");
        queryClient.invalidateQueries(["order", variables.orderId]);
      },
    }
  );
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation(api.deleteOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries("orders");
    },
  });
};

export const useDownloadOrders = () => {
  return useMutation(api.downloadOrders, {
    onSuccess: (data, variables) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "orders.xlsx");
      document.body.appendChild(link);
      link.click();
    },
  });
};

// 작성자 관련 hooks
export const useAuthors = () => {
  return useQuery("authors", api.getAuthors);
};

export const useCreateAuthor = () => {
  const queryClient = useQueryClient();
  return useMutation(api.createAuthor, {
    onSuccess: () => {
      queryClient.invalidateQueries("authors");
    },
  });
};

export const useUpdateAuthor = () => {
  const queryClient = useQueryClient();
  return useMutation(({ authorId, name }) => api.updateAuthor(authorId, name), {
    onSuccess: () => {
      queryClient.invalidateQueries("authors");
    },
  });
};

export const useDeleteAuthor = () => {
  const queryClient = useQueryClient();
  return useMutation(api.deleteAuthor, {
    onSuccess: () => {
      queryClient.invalidateQueries("authors");
    },
  });
};

// 소속 관련 hooks
export const useAffiliations = () => {
  return useQuery("affiliations", api.getAffiliations);
};

export const useCreateAffiliation = () => {
  const queryClient = useQueryClient();
  return useMutation(api.createAffiliation, {
    onSuccess: () => {
      queryClient.invalidateQueries("affiliations");
    },
  });
};

export const useUpdateAffiliation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ affiliationId, name }) => api.updateAffiliation(affiliationId, name),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("affiliations");
      },
    }
  );
};

export const useDeleteAffiliation = () => {
  const queryClient = useQueryClient();
  return useMutation(api.deleteAffiliation, {
    onSuccess: () => {
      queryClient.invalidateQueries("affiliations");
    },
  });
};

// 카테고리 관련 hooks
export const useCategories = () => {
  return useQuery("categories", api.getCategories);
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(api.createCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries("categories");
    },
  });
};

export const useCategoryDetails = (categoryId) => {
  return useQuery(
    ["category", categoryId],
    () => api.getCategoryDetails(categoryId),
    {
      enabled: !!categoryId,
    }
  );
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ categoryId, categoryData }) =>
      api.updateCategory(categoryId, categoryData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("categories");
      },
    }
  );
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(api.deleteCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries("categories");
    },
  });
};

// 주문서 양식 관련 hooks
export const useForms = () => {
  return useQuery("forms", api.getForms);
};

export const useCreateForm = () => {
  const queryClient = useQueryClient();
  return useMutation(api.createForm, {
    onSuccess: () => {
      queryClient.invalidateQueries("forms");
    },
  });
};

export const useFormDetails = (formId) => {
  return useQuery(["formDetails", formId], () => api.getFormDetails(formId), {
    enabled: !!formId,
  });
};

export const useUpdateForm = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ formId, formData }) => api.updateForm(formId, formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("forms");
      },
    }
  );
};

export const useDeleteForm = () => {
  const queryClient = useQueryClient();
  return useMutation(api.deleteForm, {
    onSuccess: () => {
      queryClient.invalidateQueries("forms");
    },
  });
};

export const useDuplicateForm = () => {
  const queryClient = useQueryClient();
  return useMutation(api.duplicateForm, {
    onSuccess: () => {
      queryClient.invalidateQueries("forms");
    },
  });
};
