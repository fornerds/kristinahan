// src/api/hooks.js
import { useQuery, useMutation, useQueryClient } from "react-query";
import * as api from "./api";
import { useNavigate } from "react-router-dom";

// 에러 처리 유틸리티 함수
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userId");
    window.location.href = "/admin/login";
    return;
  }

  // 그 외 에러 처리
  const errorMessage = error.response?.data?.detail || "오류가 발생했습니다.";
  alert(errorMessage);
};

// 인증 관련 hooks
export const useLogin = () => {
  return useMutation((loginData) => api.login(loginData), {
    onError: handleApiError,
    onSuccess: (response) => {
      const token = response.data.access_token;
      localStorage.setItem("adminToken", token);
    },
  });
};

export const useAdminLogin = () => {
  return useMutation((loginData) => api.adminLogin(loginData), {
    onError: handleApiError,
    onSuccess: (response) => {
      const token = response.data.access_token;
      localStorage.setItem("adminToken", token);
      localStorage.setItem("userId", 2);
    },
  });
};

export const useChangeUserPassword = () => {
  return useMutation(
    ({ userId, oldPassword, newPassword }) =>
      api.changeUserPassword(userId, oldPassword, newPassword),
    {
      onError: handleApiError,
      onSuccess: () => {
        alert("비밀번호가 성공적으로 변경되었습니다.");
      },
    }
  );
};

export const useChangeAdminPassword = () => {
  return useMutation(
    ({ oldPassword, newPassword }) =>
      api.changeAdminPassword(oldPassword, newPassword),
    {
      onError: handleApiError,
      onSuccess: () => {
        alert("관리자 비밀번호가 성공적으로 변경되었습니다.");
      },
    }
  );
};

// 이벤트 관련 hooks
export const useCurrentEvents = () => {
  return useQuery("currentEvents", api.getCurrentEvents, {
    onError: handleApiError,
    select: (data) => data.data,
    staleTime: 30000, // 30초 동안 캐시 데이터 사용
  });
};

export const useEventDetails = (eventId) => {
  return useQuery(["event", eventId], () => api.getEventDetails(eventId), {
    enabled: !!eventId,
    onError: handleApiError,
    select: (data) => data.data,
    staleTime: 30000,
  });
};

export const useAllEvents = () => {
  return useQuery("allEvents", api.getAllEvents, {
    onError: handleApiError,
    select: (data) => data.data,
    staleTime: 30000,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation((eventData) => api.createEvent(eventData), {
    onError: handleApiError,
    onSuccess: () => {
      queryClient.invalidateQueries("currentEvents");
      queryClient.invalidateQueries("allEvents");
      alert("이벤트가 성공적으로 생성되었습니다.");
      navigate("/admin/event");
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation(
    ({ eventId, eventData }) => api.updateEvent(eventId, eventData),
    {
      onError: handleApiError,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries("currentEvents");
        queryClient.invalidateQueries("allEvents");
        queryClient.invalidateQueries(["event", variables.eventId]);
        alert("이벤트가 성공적으로 수정되었습니다.");
        navigate("/admin/event");
      },
    }
  );
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation((eventId) => api.deleteEvent(eventId), {
    onError: handleApiError,
    onSuccess: () => {
      queryClient.invalidateQueries("currentEvents");
      queryClient.invalidateQueries("allEvents");
      alert("이벤트가 성공적으로 삭제되었습니다.");
      navigate("/admin/event");
    },
  });
};

export const useUpdateEventProgress = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ eventId, inProgress }) => api.updateEventProgress(eventId, inProgress),
    {
      onError: handleApiError,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries("currentEvents");
        queryClient.invalidateQueries("allEvents");
        queryClient.invalidateQueries(["event", variables.eventId]);
        alert("이벤트 진행 상태가 업데이트되었습니다.");
      },
    }
  );
};

// 주문서 관련 hooks
export const useOrders = (params) => {
  return useQuery(["orders", params], () => api.getOrders(params), {
    keepPreviousData: true,
    onError: handleApiError,
    select: (data) => ({
      orders: data.data.orders,
      total: data.data.total,
    }),
    staleTime: 30000,
  });
};

export const useOrderDetails = (orderId) => {
  return useQuery(["order", orderId], () => api.getOrderDetails(orderId), {
    enabled: !!orderId,
    onError: handleApiError,
    select: (data) => data.data,
    staleTime: 30000,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ orderId, status }) => api.updateOrderStatus(orderId, status),
    {
      onError: handleApiError,
      onSuccess: (_, variables) => {
        // 해당 주문의 상세 정보 업데이트
        queryClient.setQueryData(
          ["order", variables.orderId],
          (oldData) =>
            oldData && {
              ...oldData,
              status: variables.status,
            }
        );

        // 주문 목록 데이터 무효화
        queryClient.invalidateQueries("orders");

        alert("주문 상태가 성공적으로 업데이트되었습니다.");
      },
    }
  );
};

export const useSaveOrder = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ orderData, orderId, isTemp = false }) =>
      api.saveOrder(orderData, orderId, isTemp),
    {
      onError: handleApiError,
      onSuccess: (response, variables) => {
        // 새로운 주문 ID 가져오기
        const newOrderId = response.data.order_id;

        // 주문 목록 데이터 무효화
        queryClient.invalidateQueries("orders");

        // 수정인 경우 해당 주문 상세 데이터도 무효화
        if (variables.orderId) {
          queryClient.invalidateQueries(["order", variables.orderId]);
        }

        const actionType = variables.orderId ? "수정" : "저장";
        const tempStatus = variables.isTemp ? "임시 " : "";
        alert(`주문서가 성공적으로 ${tempStatus}${actionType}되었습니다.`);

        return newOrderId;
      },
    }
  );
};

export const useDownloadOrders = () => {
  return useMutation((params) => api.downloadOrders(params), {
    onError: handleApiError,
    onSuccess: (data, variables) => {
      // Blob 생성 및 다운로드
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // 파일명 생성 (날짜 기반)
      const today = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `orders_${today}.xlsx`);

      // 다운로드 트리거
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
};

// 작성자 관련 hooks
export const useAuthors = () => {
  return useQuery("authors", api.getAuthors, {
    onError: handleApiError,
    select: (data) => data.data,
    staleTime: 30000,
  });
};

export const useCreateAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation((authorData) => api.createAuthor(authorData), {
    onError: handleApiError,
    onSuccess: (response) => {
      queryClient.invalidateQueries("authors");
      alert("작성자가 성공적으로 등록되었습니다.");
      return response.data;
    },
  });
};

export const useUpdateAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ authorId, authorData }) => api.updateAuthor(authorId, authorData),
    {
      onError: handleApiError,
      onSuccess: (response) => {
        queryClient.invalidateQueries("authors");
        alert("작성자 정보가 성공적으로 수정되었습니다.");
        return response.data;
      },
    }
  );
};

export const useDeleteAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation((authorId) => api.deleteAuthor(authorId), {
    onError: handleApiError,
    onSuccess: () => {
      queryClient.invalidateQueries("authors");
      alert("작성자 정보가 성공적으로 수정되었습니다.");
    },
    onMutate: async (authorId) => {
      // 낙관적 업데이트를 위한 이전 데이터 백업
      await queryClient.cancelQueries("authors");
      const previousAuthors = queryClient.getQueryData("authors") || [];

      // 낙관적으로 작성자 제거
      if (Array.isArray(previousAuthors)) {
        queryClient.setQueryData(
          "authors",
          previousAuthors.filter((author) => author.id !== authorId)
        );
      }

      return { previousAuthors };
    },
    onError: (err, authorId, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousAuthors) {
        queryClient.setQueryData("authors", context.previousAuthors);
      }
      handleApiError(err);
    },
  });
};

// 소속 관련 hooks
export const useAffiliations = () => {
  return useQuery("affiliations", api.getAffiliations, {
    onError: handleApiError,
    select: (data) => data.data,
    staleTime: 30000,
  });
};

export const useCreateAffiliation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (affiliationData) => api.createAffiliation(affiliationData),
    {
      onError: handleApiError,
      onSuccess: (response) => {
        queryClient.invalidateQueries("affiliations");
        alert("소속이 성공적으로 등록되었습니다.");
        return response.data;
      },
    }
  );
};

export const useUpdateAffiliation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ affiliationId, affiliationData }) =>
      api.updateAffiliation(affiliationId, affiliationData),
    {
      onError: handleApiError,
      onSuccess: (response) => {
        queryClient.invalidateQueries("affiliations");
        alert("소속 정보가 성공적으로 수정되었습니다.");
        return response.data;
      },
      onMutate: async ({ affiliationId, affiliationData }) => {
        await queryClient.cancelQueries("affiliations");
        const previousAffiliations =
          queryClient.getQueryData("affiliations") || [];

        if (Array.isArray(previousAffiliations)) {
          queryClient.setQueryData(
            "affiliations",
            previousAffiliations.map((affiliation) =>
              affiliation.id === affiliationId
                ? { ...affiliation, ...affiliationData }
                : affiliation
            )
          );
        }

        return { previousAffiliations };
      },
      onError: (err, variables, context) => {
        if (context?.previousAffiliations) {
          queryClient.setQueryData(
            "affiliations",
            context.previousAffiliations
          );
        }
        handleApiError(err);
      },
    }
  );
};

export const useDeleteAffiliation = () => {
  const queryClient = useQueryClient();

  return useMutation((affiliationId) => api.deleteAffiliation(affiliationId), {
    onError: handleApiError,
    onSuccess: () => {
      queryClient.invalidateQueries("affiliations");
      alert("소속이 성공적으로 삭제되었습니다.");
    },
    onMutate: async (affiliationId) => {
      await queryClient.cancelQueries("affiliations");
      const previousAffiliations =
        queryClient.getQueryData("affiliations") || [];

      if (Array.isArray(previousAffiliations)) {
        queryClient.setQueryData(
          "affiliations",
          previousAffiliations.filter(
            (affiliation) => affiliation.id !== affiliationId
          )
        );
      }

      return { previousAffiliations };
    },
    onError: (err, affiliationId, context) => {
      if (context?.previousAffiliations) {
        queryClient.setQueryData("affiliations", context.previousAffiliations);
      }
      handleApiError(err);
    },
  });
};

// 카테고리 관련 hooks
export const useCategories = () => {
  return useQuery("categories", api.getCategories, {
    onError: handleApiError,
    select: (data) => data.data,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useCategoryDetails = (categoryId) => {
  return useQuery(
    ["category", categoryId],
    () => api.getCategoryDetails(categoryId),
    {
      enabled: !!categoryId,
      onError: handleApiError,
      select: (data) => data.data,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  );
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation((categoryData) => api.createCategory(categoryData), {
    onError: handleApiError,
    onSuccess: (response) => {
      queryClient.invalidateQueries("categories");
      alert("카테고리가 성공적으로 생성되었습니다.");
      return response.data;
    },
    onMutate: async (newCategory) => {
      // 낙관적 업데이트를 위한 이전 데이터 백업
      await queryClient.cancelQueries("categories");
      const previousCategories = queryClient.getQueryData("categories");

      // 새로운 카테고리를 임시 ID와 함께 추가
      queryClient.setQueryData("categories", (old) => {
        const tempId = `temp-${Date.now()}`;
        const newCategoryWithId = {
          id: tempId,
          name: newCategory.name,
          products: newCategory.products || [],
          created_at: new Date().toISOString(),
        };
        return old ? [...old, newCategoryWithId] : [newCategoryWithId];
      });

      return { previousCategories };
    },
    onError: (err, newCategory, context) => {
      queryClient.setQueryData("categories", context.previousCategories);
      handleApiError(err);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ categoryId, categoryData }) =>
      api.updateCategory(categoryId, categoryData),
    {
      onError: handleApiError,
      onSuccess: (response, variables) => {
        // 카테고리 목록과 상세 정보 모두 무효화
        queryClient.invalidateQueries("categories");
        queryClient.invalidateQueries(["category", variables.categoryId]);
        alert("카테고리가 성공적으로 수정되었습니다.");
        return response.data;
      },
      onMutate: async ({ categoryId, categoryData }) => {
        // 낙관적 업데이트를 위한 이전 데이터 백업
        await queryClient.cancelQueries("categories");
        await queryClient.cancelQueries(["category", categoryId]);

        const previousCategories = queryClient.getQueryData("categories");
        const previousCategory = queryClient.getQueryData([
          "category",
          categoryId,
        ]);

        // 카테고리 목록 업데이트
        queryClient.setQueryData("categories", (old) =>
          old
            ? old.map((category) =>
                category.id === categoryId
                  ? {
                      ...category,
                      name: categoryData.name,
                      products: categoryData.products || category.products,
                    }
                  : category
              )
            : old
        );

        // 카테고리 상세 정보 업데이트
        if (previousCategory) {
          queryClient.setQueryData(["category", categoryId], {
            ...previousCategory,
            ...categoryData,
          });
        }

        return { previousCategories, previousCategory };
      },
      onError: (err, variables, context) => {
        // 에러 발생 시 이전 데이터로 롤백
        queryClient.setQueryData("categories", context.previousCategories);
        queryClient.setQueryData(
          ["category", variables.categoryId],
          context.previousCategory
        );
        handleApiError(err);
      },
    }
  );
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation((categoryId) => api.deleteCategory(categoryId), {
    onError: handleApiError,
    onSuccess: (_, categoryId) => {
      queryClient.invalidateQueries("categories");
      queryClient.removeQueries(["category", categoryId]);
      alert("카테고리가 성공적으로 삭제되었습니다.");
    },
    onMutate: async (categoryId) => {
      // 낙관적 업데이트를 위한 이전 데이터 백업
      await queryClient.cancelQueries("categories");
      await queryClient.cancelQueries(["category", categoryId]);

      const previousCategories = queryClient.getQueryData("categories");
      const previousCategory = queryClient.getQueryData([
        "category",
        categoryId,
      ]);

      // 카테고리 목록에서 제거
      queryClient.setQueryData("categories", (old) =>
        old ? old.filter((category) => category.id !== categoryId) : old
      );

      // 카테고리 상세 정보 제거
      queryClient.removeQueries(["category", categoryId]);

      return { previousCategories, previousCategory };
    },
    onError: (err, categoryId, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      queryClient.setQueryData("categories", context.previousCategories);
      if (context.previousCategory) {
        queryClient.setQueryData(
          ["category", categoryId],
          context.previousCategory
        );
      }
      handleApiError(err);
    },
  });
};

// 주문서 양식 관련 hooks
export const useForms = () => {
  return useQuery("forms", api.getForms, {
    onError: handleApiError,
    select: (data) => data.data,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useFormDetails = (formId) => {
  return useQuery(["form", formId], () => api.getFormDetails(formId), {
    enabled: !!formId,
    onError: handleApiError,
    select: (data) => data.data,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateForm = () => {
  const queryClient = useQueryClient();

  return useMutation((formData) => api.createForm(formData), {
    onError: handleApiError,
    onSuccess: (response) => {
      queryClient.invalidateQueries("forms");
      alert("주문서 양식이 성공적으로 생성되었습니다.");
      return response.data;
    },
    onMutate: async (newForm) => {
      await queryClient.cancelQueries("forms");
      const previousForms = queryClient.getQueryData("forms");

      // 새로운 양식을 임시 ID와 함께 추가
      queryClient.setQueryData("forms", (old) => {
        const tempId = `temp-${Date.now()}`;
        const newFormWithId = {
          id: tempId,
          name: newForm.name,
          repairs: newForm.repairs || [],
          categories: newForm.categories || [],
          created_at: new Date().toISOString(),
        };
        return old ? [...old, newFormWithId] : [newFormWithId];
      });

      return { previousForms };
    },
    onError: (err, newForm, context) => {
      queryClient.setQueryData("forms", context.previousForms);
      handleApiError(err);
    },
  });
};

export const useUpdateForm = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ formId, formData }) => api.updateForm(formId, formData),
    {
      onError: handleApiError,
      onSuccess: (response, variables) => {
        queryClient.invalidateQueries("forms");
        queryClient.invalidateQueries(["form", variables.formId]);
        alert("주문서 양식이 성공적으로 수정되었습니다.");
        return response.data;
      },
      onMutate: async ({ formId, formData }) => {
        await queryClient.cancelQueries("forms");
        await queryClient.cancelQueries(["form", formId]);

        const previousForms = queryClient.getQueryData("forms");
        const previousForm = queryClient.getQueryData(["form", formId]);

        // 양식 목록 업데이트
        queryClient.setQueryData("forms", (old) =>
          old
            ? old.map((form) =>
                form.id === formId
                  ? {
                      ...form,
                      name: formData.name,
                      repairs: formData.repairs || form.repairs,
                      categories: formData.categories || form.categories,
                    }
                  : form
              )
            : old
        );

        // 양식 상세 정보 업데이트
        if (previousForm) {
          queryClient.setQueryData(["form", formId], {
            ...previousForm,
            ...formData,
          });
        }

        return { previousForms, previousForm };
      },
      onError: (err, variables, context) => {
        queryClient.setQueryData("forms", context.previousForms);
        if (context.previousForm) {
          queryClient.setQueryData(
            ["form", variables.formId],
            context.previousForm
          );
        }
        handleApiError(err);
      },
    }
  );
};

export const useDeleteForm = () => {
  const queryClient = useQueryClient();

  return useMutation((formId) => api.deleteForm(formId), {
    onError: handleApiError,
    onSuccess: (_, formId) => {
      queryClient.invalidateQueries("forms");
      queryClient.removeQueries(["form", formId]);
      alert("주문서 양식이 성공적으로 삭제되었습니다.");
    },
    onMutate: async (formId) => {
      await queryClient.cancelQueries("forms");
      await queryClient.cancelQueries(["form", formId]);

      const previousForms = queryClient.getQueryData("forms");
      const previousForm = queryClient.getQueryData(["form", formId]);

      // 양식 목록에서 제거
      queryClient.setQueryData("forms", (old) =>
        old ? old.filter((form) => form.id !== formId) : old
      );

      // 양식 상세 정보 제거
      queryClient.removeQueries(["form", formId]);

      return { previousForms, previousForm };
    },
    onError: (err, formId, context) => {
      queryClient.setQueryData("forms", context.previousForms);
      if (context.previousForm) {
        queryClient.setQueryData(["form", formId], context.previousForm);
      }
      handleApiError(err);
    },
  });
};

export const useDuplicateForm = () => {
  const queryClient = useQueryClient();

  return useMutation((formId) => api.duplicateForm(formId), {
    onError: handleApiError,
    onSuccess: (response) => {
      queryClient.invalidateQueries("forms");
      alert("주문서 양식이 성공적으로 복제되었습니다.");
      return response.data;
    },
  });
};

// Rates 관련 hooks
export const useGoldPrice = (params) => {
  return useQuery(["goldPrice", params], () => api.getGoldPriceInfo(params), {
    onError: handleApiError,
    select: (data) => ({
      resultCode: data.data.result_code,
      resultMsg: data.data.result_msg,
      items: data.data.items.map((item) => ({
        tradeQuantity: item.trqu,
        tradePrice: item.trPrc,
        baseDate: item.basDt,
        shortCode: item.srtnCd,
        isinCode: item.isinCd,
        itemName: item.itmsNm,
        closePrice: item.clpr,
        change: item.vs,
        changeRate: item.fltRt,
        marketPrice: item.mkp,
        highPrice: item.hipr,
        lowPrice: item.lopr,
        gold10K: item.gold_10k,
        gold14K: item.gold_14k,
        gold18K: item.gold_18k,
        gold24K: item.gold_24k,
      })),
    }),
    staleTime: 60000, // 1분
    cacheTime: 300000, // 5분
    refetchInterval: 300000, // 5분마다 자동 갱신
  });
};

export const useExchangeRate = (params) => {
  return useQuery(
    ["exchangeRate", params],
    () => api.getExchangeRateInfo(params),
    {
      onError: handleApiError,
      select: (data) => ({
        items: data.data.items.map((item) => ({
          currencyUnit: item.cur_unit,
          baseRate: item.deal_bas_r,
          currencyName: item.cur_nm,
        })),
      }),
      staleTime: 60000, // 1분
      cacheTime: 300000, // 5분
      refetchInterval: 300000, // 5분마다 자동 갱신
    }
  );
};
