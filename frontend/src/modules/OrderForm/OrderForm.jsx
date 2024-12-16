import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Input } from "../../components";
import PaymentTable from "./PaymentTable/PaymentTable";
import { Modal } from "../Modal";
import styles from "./OrderForm.module.css";
import {
  useOrderDetails,
  useAuthors,
  useAffiliations,
  useEventDetails,
  useCategories,
  useSaveOrder,
  useUpdateOrderStatus,
} from "../../api/hooks";

const ORDER_STATUS_MAP = {
  "Order Completed": "주문완료",
  "Packaging Completed": "포장완료",
  "Repair Received": "수선접수",
  "Repair Completed": "수선완료",
  "In delivery": "배송중",
  "Delivery completed": "배송완료",
  "Receipt completed": "수령완료",
  Accommodation: "숙소",
  Counsel: "상담",
};

const chunk = (array, size) => {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
};

const convertStatusFromApiFormat = (status) => {
  return status.replace(/_/g, " ");
};

export const OrderForm = ({ event_id, orderId, onSave, onComplete }) => {
  const { data: orderData, isLoading: isLoadingOrderDetails } =
    useOrderDetails(orderId);
  const { data: event, isLoading: isEventLoading } = useEventDetails(event_id);
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: authors, isLoading: isLoadingAuthors } = useAuthors();
  const { data: affiliations, isLoading: isLoadingAffiliations } =
    useAffiliations();
  const saveOrderMutation = useSaveOrder();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  // console.log(orderData);
  // console.log(event);

  const [formData, setFormData] = useState({
    event_id: event_id,
    author_id: null,
    affiliation_id: null,
    groomName: "",
    brideName: "",
    contact: "",
    address: "",
    collectionMethod: "",
    notes: "",
    totalPrice: 0,
    advancePayment: 0,
    balancePayment: 0,
    isTemporary: false,
    status: "",
    alteration_details: [],
    alter_notes: "",
  });

  const [selectedProducts, setSelectedProducts] = useState({});
  const [orderCategories, setOrderCategories] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [affiliationError, setAffiliationError] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [prepaymentTotal, setPrepaymentTotal] = useState(0);
  const [balanceTotal, setBalanceTotal] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [payments, setPayments] = useState([
    {
      payment_date: new Date().toISOString(),
      paymentMethod: "ADVANCE",
      cashAmount: 0,
      cashCurrency: "KRW",
      cashConversion: 0,
      cardAmount: 0,
      cardCurrency: "KRW",
      cardConversion: 0,
      tradeInAmount: 0,
      tradeInCurrency: "",
      tradeInConversion: 0,
      notes: "",
      payerName: "",
    },
    {
      payment_date: new Date().toISOString(),
      paymentMethod: "BALANCE",
      cashAmount: 0,
      cashCurrency: "KRW",
      cashConversion: 0,
      cardAmount: 0,
      cardCurrency: "KRW",
      cardConversion: 0,
      tradeInAmount: 0,
      tradeInCurrency: "",
      tradeInConversion: 0,
      notes: "",
      payerName: "",
    },
  ]);

  const initializePayments = (paymentData) => {
    const totalAmount =
      (Number(paymentData.cashAmount) || 0) +
      (Number(paymentData.cardAmount) || 0) +
      (Number(paymentData.tradeInAmount) || 0);

    return {
      ...paymentData,
      cashAmount: Number(paymentData.cashAmount) || 0,
      cardAmount: Number(paymentData.cardAmount) || 0,
      tradeInAmount: Number(paymentData.tradeInAmount) || 0,
      totalConvertedAmount: totalAmount,
    };
  };

  const groupedProducts = useMemo(() => {
    if (!categories || !event) return {};
    const newGroupedProducts = {};
    orderCategories.forEach((category) => {
      newGroupedProducts[category.id] = category.products;
    });
    return newGroupedProducts;
  }, [categories, event, orderCategories]);

  // console.log(groupedProducts);

  const prepareOrderData = useCallback(() => {
    const safeParseInt = (value) => {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? null : parsed;
    };

    const safeParseFloat = (value) => {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    const convertStatusToApiFormat = (status) => {
      return status.replace(/ /g, "_");
    };

    const convertTradeInCurrency = (currency) => {
      if (!currency) return null;
      const currencyMap = {
        "10K": "K10",
        "14K": "K14",
        "18K": "K18",
        "24K": "K24",
      };
      return currencyMap[currency] || currency;
    };

    const orderItems = Object.values(selectedProducts)
      .filter((item) => item.productId)
      .map((item) => ({
        product_id: safeParseInt(item.productId),
        attributes_id:
          item.attributes && item.attributes.length > 0
            ? safeParseInt(item.attributes[0].id)
            : null,
        quantity: safeParseInt(item.quantity) || 0,
        price: (item.price || 0) * (safeParseInt(item.quantity) || 0),
      }));

    const paymentsData = payments.map((payment) => {
      const basePayment = {
        payer: payment.payerName || formData.groomName,
        payment_date: payment.payment_date || new Date().toISOString(),
        paymentMethod: payment.paymentMethod.toLowerCase(),
        notes: payment.notes || "",
      };

      // 현금 결제가 있는 경우만 추가
      if (payment.cashAmount && payment.cashAmount > 0) {
        basePayment.cashAmount = payment.cashAmount;
        basePayment.cashCurrency = payment.cashCurrency;
        basePayment.cashConversion = payment.cashConversion;
      }

      // 카드 결제가 있는 경우만 추가
      if (payment.cardAmount && payment.cardAmount > 0) {
        basePayment.cardAmount = payment.cardAmount;
        basePayment.cardCurrency = payment.cardCurrency;
        basePayment.cardConversion = payment.cardConversion;
      }

      // 보상판매가 있는 경우만 추가
      if (payment.tradeInAmount && payment.tradeInAmount > 0) {
        basePayment.tradeInAmount = payment.tradeInAmount;
        basePayment.tradeInCurrency = convertTradeInCurrency(
          payment.tradeInCurrency
        );
        basePayment.tradeInConversion = payment.tradeInConversion;
      }

      return basePayment;
    });

    // Update alteration_details to new format
    const alterationDetails = formData.alteration_details.map((detail) => ({
      form_repair_id: detail.form_repair_id,
      figure: detail.figure || 0,
      alterationFigure: detail.alterationFigure || 0,
    }));

    return {
      event_id: safeParseInt(event_id),
      author_id: safeParseInt(formData.author_id),
      modifier_id: safeParseInt(formData.modifier_id),
      affiliation_id: safeParseInt(formData.affiliation_id),
      status: convertStatusToApiFormat(formData.status),
      groomName: formData.groomName || null,
      brideName: formData.brideName || null,
      contact: formData.contact || "",
      address: formData.address || "",
      collectionMethod: formData.collectionMethod || "",
      notes: formData.notes || "",
      alter_notes: formData.alter_notes || "",
      totalPrice,
      advancePayment: prepaymentTotal,
      balancePayment: balanceTotal,
      orderItems,
      payments: paymentsData,
      alteration_details: alterationDetails,
    };
  }, [
    formData,
    event_id,
    selectedProducts,
    payments,
    totalPrice,
    prepaymentTotal,
    balanceTotal,
    event, // Add event to dependencies
  ]);

  useEffect(() => {
    if (orderData && categories) {
      console.log("Server response - orderData:", orderData);

      // 결제 정보 초기화
      const advancePayment = orderData.payments.find(
        (p) => p.paymentMethod === "advance"
      );
      const balancePayment = orderData.payments.find(
        (p) => p.paymentMethod === "balance"
      );

      console.log("Found payments from server:", {
        advancePayment,
        balancePayment,
        advanceConversions: {
          cash: advancePayment?.cashConversion,
          card: advancePayment?.cardConversion,
          tradeIn: advancePayment?.tradeInConversion,
        },
        balanceConversions: {
          cash: balancePayment?.cashConversion,
          card: balancePayment?.cardConversion,
          tradeIn: balancePayment?.tradeInConversion,
        },
      });

      // alteration details 초기화
      let alterationDetails = [];
      if (event?.form?.repairs && orderData.alteration_details) {
        alterationDetails = event.form.repairs.map((repair) => {
          const existingDetail = orderData.alteration_details.find(
            (d) => d.form_repair_id === repair.id
          );
          return (
            existingDetail || {
              form_repair_id: repair.id,
              figure: 0,
              alterationFigure: 0,
            }
          );
        });
      }

      // API로 조회한 카테고리 순서 유지
      const orderedCategories = event.form.categories
        .map((formCategory) => {
          const fullCategory = categories.find(
            (cat) => cat.id === formCategory.id
          );
          return fullCategory;
        })
        .filter(Boolean); // null/undefined 제거

      // 상품 정보 초기화
      const newSelectedProducts = {};
      orderData.orderItems.forEach((item) => {
        const category = orderedCategories.find((cat) =>
          cat.products.some((prod) => prod.id === item.product.id)
        );
        if (category) {
          newSelectedProducts[category.id] = {
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            attributes: item.attributes,
          };
        }
      });

      // payments 초기화
      const initialPayments = [
        {
          payment_date: advancePayment?.payment_date,
          paymentMethod: "ADVANCE",
          // 현금 정보
          cashAmount: advancePayment?.cashAmount || 0,
          cashCurrency: advancePayment?.cashCurrency || "KRW",
          cashConversion: advancePayment?.cashConversion || 0,
          // 카드 정보
          cardAmount: advancePayment?.cardAmount || 0,
          cardCurrency: advancePayment?.cardCurrency || "KRW",
          cardConversion: advancePayment?.cardConversion || 0,
          // 보상판매 정보
          tradeInAmount: advancePayment?.tradeInAmount || 0,
          tradeInCurrency: advancePayment?.tradeInCurrency || "",
          tradeInConversion: advancePayment?.tradeInConversion || 0,
          // 기타 정보
          notes: advancePayment?.notes || "",
          payerName: advancePayment?.payer || "",
        },
        {
          payment_date: balancePayment?.payment_date,
          paymentMethod: "BALANCE",
          // 현금 정보
          cashAmount: balancePayment?.cashAmount || 0,
          cashCurrency: balancePayment?.cashCurrency || "KRW",
          cashConversion: balancePayment?.cashConversion || 0,
          // 카드 정보
          cardAmount: balancePayment?.cardAmount || 0,
          cardCurrency: balancePayment?.cardCurrency || "KRW",
          cardConversion: balancePayment?.cardConversion || 0,
          // 보상판매 정보
          tradeInAmount: balancePayment?.tradeInAmount || 0,
          tradeInCurrency: balancePayment?.tradeInCurrency || "",
          tradeInConversion: balancePayment?.tradeInConversion || 0,
          // 기타 정보
          notes: balancePayment?.notes || "",
          payerName: balancePayment?.payer || "",
        },
      ];

      // 선입금과 잔금 총액 계산
      const advanceTotal =
        (advancePayment?.cashConversion || 0) +
        (advancePayment?.cardConversion || 0) +
        (advancePayment?.tradeInConversion || 0);

      const balanceTotal =
        (balancePayment?.cashConversion || 0) +
        (balancePayment?.cardConversion || 0) +
        (balancePayment?.tradeInConversion || 0);

      // 모든 상태 한번에 업데이트
      setPayments(initialPayments);
      setPrepaymentTotal(advanceTotal);
      setBalanceTotal(balanceTotal);
      setFormData((prev) => ({
        ...prev,
        ...orderData,
        status: convertStatusFromApiFormat(orderData.status),
        alteration_details: alterationDetails,
        alter_notes: orderData.alter_notes || "",
        author_id: orderData.author_id || "",
        modifier_id: orderData.modifier_id || "",
      }));
      setOrderCategories(orderedCategories); // 순서가 유지된 카테고리 배열 설정
      setSelectedProducts(newSelectedProducts);
      setTotalPrice(Number(orderData.totalPrice) || 0);
      setCustomerName(orderData.groomName || "");
    }
  }, [orderData?.id, categories, event?.form?.repairs]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId: orderId,
        status: newStatus,
      });
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const handleAuthorChange = (e) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      author_id: value ? parseInt(value, 10) : null,
    }));
  };

  const handleModifierChange = (e) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      modifier_id: value ? parseInt(value, 10) : null,
    }));
  };

  const handleStatusChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, status: value }));
    handleStatusUpdate(value);
  };

  const handleContactChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, contact: value }));
  };

  const validateAffiliation = () => {
    if (!formData.affiliation_id) {
      setAffiliationError("소속을 선택해주세요.");
      setIsErrorModalOpen(true);
      return false;
    }
    setAffiliationError("");
    return true;
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
  };

  const handleAffiliationChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, affiliation_id: value }));
    if (value) {
      setAffiliationError("");
    }
  };

  const handleAddressChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, address: value }));
  };

  const handleCollectionMethodChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, collectionMethod: value }));
  };

  const handleNotesChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, notes: value }));
  };

  const handleAlterationChange = (repairId, field, value) => {
    if (field === "notes") {
      setFormData((prev) => ({
        ...prev,
        alter_notes: value,
      }));
      return;
    }

    setFormData((prev) => {
      const updatedDetails = [...prev.alteration_details];
      const existingDetailIndex = updatedDetails.findIndex(
        (detail) => detail.form_repair_id === repairId
      );

      // value가 문자열인 경우 (입력 진행 중)
      if (typeof value === "string") {
        // 입력 진행 중인 값 그대로 유지
        if (existingDetailIndex >= 0) {
          updatedDetails[existingDetailIndex] = {
            ...updatedDetails[existingDetailIndex],
            [field === "figure" ? "figure" : "alterationFigure"]: value,
          };
        } else {
          updatedDetails.push({
            form_repair_id: repairId,
            figure: field === "figure" ? value : 0,
            alterationFigure: field === "alteration" ? value : 0,
          });
        }
      } else {
        // 숫자값으로 변환된 경우 (onBlur 등에서 호출)
        if (existingDetailIndex >= 0) {
          updatedDetails[existingDetailIndex] = {
            ...updatedDetails[existingDetailIndex],
            [field === "figure" ? "figure" : "alterationFigure"]:
              field === "figure" ? Math.max(0, value) : value,
          };
        } else {
          updatedDetails.push({
            form_repair_id: repairId,
            figure: field === "figure" ? Math.max(0, value) : 0,
            alterationFigure: field === "alteration" ? value : 0,
          });
        }
      }

      return {
        ...prev,
        alteration_details: updatedDetails,
      };
    });
  };

  const handleGroomNameChange = useCallback((e) => {
    const newGroomName = e.target.value;
    setFormData((prev) => ({ ...prev, groomName: newGroomName }));
  }, []);

  const handleBrideNameChange = useCallback((e) => {
    const newBrideName = e.target.value;
    setFormData((prev) => ({ ...prev, brideName: newBrideName }));
  }, []);

  const handleProductChange = useCallback(
    (categoryId, field, value) => {
      setSelectedProducts((prev) => {
        const newState = { ...prev };
        if (field === "productId") {
          const productId = parseInt(value, 10);
          const selectedProduct = groupedProducts[categoryId]?.find(
            (p) => p.id === productId
          );
          if (selectedProduct) {
            newState[categoryId] = {
              productId: selectedProduct.id,
              price: selectedProduct.price,
              quantity: 1,
              attributes: selectedProduct.attributes.map((attr) => ({
                id: attr.id,
                value: "",
              })),
            };
          } else {
            newState[categoryId] = {
              productId: "",
              price: 0,
              quantity: 1,
              attributes: [],
            };
          }
        } else if (field === "attributes") {
          const selectedProduct = groupedProducts[categoryId]?.find(
            (p) => p.id === newState[categoryId].productId
          );
          if (selectedProduct) {
            const selectedAttributeId = parseInt(value, 10);
            const selectedAttribute = selectedProduct.attributes.find(
              (attr) => attr.id === selectedAttributeId
            );
            if (selectedAttribute) {
              newState[categoryId] = {
                ...newState[categoryId],
                attributes: [
                  {
                    id: selectedAttribute.id,
                    value: selectedAttribute.value,
                  },
                ],
              };
            }
          }
        } else {
          newState[categoryId] = {
            ...newState[categoryId],
            [field]: value,
          };
        }
        return newState;
      });
    },
    [groupedProducts]
  );

  const handlePaymentChange = useCallback((index, updatedPayment) => {
    setPayments((prev) => {
      const newPayments = [...prev];
      const basePayment = {
        payment_date: updatedPayment.payment_date || new Date().toISOString(),
        paymentMethod: index === 0 ? "ADVANCE" : "BALANCE",
        payerName: updatedPayment.payerName || "",
        notes: updatedPayment.notes || "",
      };

      // 현금 결제 처리
      if (updatedPayment.cashAmount && updatedPayment.cashAmount > 0) {
        basePayment.cashAmount = updatedPayment.cashAmount;
        basePayment.cashCurrency = updatedPayment.cashCurrency;
        basePayment.cashConversion = updatedPayment.cashConversion;
      }

      // 카드 결제 처리
      if (updatedPayment.cardAmount && updatedPayment.cardAmount > 0) {
        basePayment.cardAmount = updatedPayment.cardAmount;
        basePayment.cardCurrency = updatedPayment.cardCurrency;
        basePayment.cardConversion = updatedPayment.cardConversion;
      }

      // 보상판매 처리
      if (updatedPayment.tradeInAmount && updatedPayment.tradeInAmount > 0) {
        basePayment.tradeInAmount = updatedPayment.tradeInAmount;
        basePayment.tradeInCurrency = updatedPayment.tradeInCurrency;
        basePayment.tradeInConversion = updatedPayment.tradeInConversion;
      }

      newPayments[index] = basePayment;

      console.log(`Payment ${index} updated:`, basePayment);
      return newPayments;
    });

    // 각 결제 수단별 환산액 합계 계산
    const newTotal =
      (updatedPayment.cashAmount > 0 ? updatedPayment.cashConversion : 0) +
      (updatedPayment.cardAmount > 0 ? updatedPayment.cardConversion : 0) +
      (updatedPayment.tradeInAmount > 0 ? updatedPayment.tradeInConversion : 0);

    console.log(`Calculated total for payment ${index}:`, {
      cash: updatedPayment.cashConversion || 0,
      card: updatedPayment.cardConversion || 0,
      tradeIn: updatedPayment.tradeInConversion || 0,
      total: newTotal,
    });

    // 선입금/잔금 총액 업데이트
    if (index === 0) {
      setPrepaymentTotal(newTotal);
    } else {
      setBalanceTotal(newTotal);
    }
  }, []);

  useEffect(() => {
    const newTotalPrice = Object.values(selectedProducts).reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
    setTotalPrice(newTotalPrice);
    setFormData((prev) => ({
      ...prev,
      totalPrice: newTotalPrice,
      advancePayment: prepaymentTotal,
      balancePayment: balanceTotal,
    }));
  }, [selectedProducts, prepaymentTotal, balanceTotal]);

  useEffect(() => {
    if (onSave) {
      onSave(prepareOrderData);
      // console.log(prepareOrderData);
    }
  }, [onSave, prepareOrderData]);

  if (
    isLoadingOrderDetails ||
    isLoadingAuthors ||
    isLoadingAffiliations ||
    isEventLoading ||
    isCategoriesLoading ||
    saveOrderMutation.isLoading ||
    updateOrderStatusMutation.isLoading
  ) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>주문정보</h3>

        <div className={styles.sectionValueWrap}>
          <h4 className={styles.sectionLabel}>주문번호</h4>
          <p className={styles.sectionValue}>
            {formData.orderNumber || formData.id}
          </p>
        </div>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionGroup}>
            <h4 className={styles.sectionLabel}>수정자</h4>
            <select
              name="modifier_id"
              id={styles.rewriter}
              onChange={handleModifierChange}
              value={formData.modifier_id || ""}
            >
              <option value="">수정자 선택</option>
              {authors &&
                authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
            </select>
          </div>
          <div className={styles.sectionGroup}>
            <h4 className={styles.sectionLabel}>수정일자</h4>
            <p className={styles.sectionValue}>
              {new Date().toLocaleDateString("ko-KR")}
            </p>
          </div>
          <div className={styles.sectionGroup}>
            <h4 className={styles.sectionLabel}>작성자</h4>
            <select
              name="author_id"
              id={styles.writer}
              onChange={handleAuthorChange}
              value={formData.author_id || ""}
            >
              <option value="">작성자 선택</option>
              {authors &&
                authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
            </select>
          </div>
          <div className={styles.sectionGroup}>
            <h4 className={styles.sectionLabel}>작성일자</h4>
            <p className={styles.sectionValue}>
              {orderData?.created_at
                ? new Date(orderData.created_at).toLocaleDateString("ko-KR")
                : "-"}
            </p>
          </div>
        </div>

        <div className={styles.sectionGroupWrap}>
          <h4 className={styles.sectionLabel}>주문상태</h4>

          <form className={`${styles.sectionGroup} ${styles.statusWrap}`}>
            {Object.entries(ORDER_STATUS_MAP).map(([value, label]) => (
              <div key={value} className={styles.statusLable}>
                <input
                  type="radio"
                  name="status"
                  id={value}
                  value={value}
                  checked={formData.status === value}
                  onChange={handleStatusChange}
                />
                <label htmlFor={value}>{label}</label>
              </div>
            ))}
          </form>
        </div>
      </section>

      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>주문자정보</h3>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>신랑</h4>
            <Input
              type="text"
              className={styles.textInput}
              value={formData.groomName}
              onChange={handleGroomNameChange}
              placeholder="신랑 이름"
            />
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>신부</h4>
            <Input
              type="text"
              className={styles.textInput}
              value={formData.brideName}
              onChange={handleBrideNameChange}
              placeholder="신부 이름"
            />
          </div>
        </div>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>연락처</h4>
            <Input
              type="tel"
              className={styles.textInput}
              name="contact"
              value={formData.contact}
              onChange={handleContactChange}
            />
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>소속</h4>
            <select
              name="affiliation_id"
              id={styles.relation}
              value={formData.affiliation_id}
              onChange={handleAffiliationChange}
            >
              <option value="">소속 선택</option>
              {affiliations &&
                affiliations.map((affiliation) => (
                  <option key={affiliation.id} value={affiliation.id}>
                    {affiliation.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>배송지 입력</h4>
            <Input
              type="text"
              className={styles.addressInput}
              name="address"
              value={formData.address}
              onChange={handleAddressChange}
            />
          </div>

          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>수령방법</h4>
            <select
              name="collectionMethod"
              id={styles.takeout}
              value={formData.collectionMethod}
              onChange={handleCollectionMethodChange}
            >
              <option value="">선택</option>
              <option value="Delivery">배송</option>
              <option value="Pickup on site">현장수령 (기혼 불가)</option>
              <option value="Pickup in store">매장수령</option>
            </select>
          </div>
        </div>

        <div className={styles.sectionValueWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>기타사항</h4>
            <textarea
              name="notes"
              id="optionalMessage"
              className={styles.optionalMessage}
              value={formData.notes}
              onChange={handleNotesChange}
            ></textarea>
          </div>
        </div>
      </section>

      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>상품정보</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">카테고리</th>
              <th scope="col">상품명</th>
              <th scope="col">사이즈</th>
              <th scope="col">개수</th>
              <th scope="col">가격</th>
            </tr>
          </thead>
          <tbody>
            {orderCategories.map((category) => {
              const productInfo = selectedProducts[category.id];
              const selectedProduct = category.products?.find(
                (p) => p.id === parseInt(productInfo?.productId, 10)
              );
              return (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>
                    <select
                      value={productInfo?.productId || ""}
                      onChange={(e) =>
                        handleProductChange(
                          category.id,
                          "productId",
                          e.target.value
                        )
                      }
                    >
                      <option value="">선택</option>
                      {category.products?.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {productInfo?.productId && (
                      <select
                        value={productInfo?.attributes?.[0]?.id || ""}
                        onChange={(e) =>
                          handleProductChange(
                            category.id,
                            "attributes",
                            e.target.value
                          )
                        }
                      >
                        <option value="">선택</option>
                        {selectedProduct?.attributes?.map((attr) => (
                          <option key={attr.id} value={attr.id}>
                            {attr.value}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    <Input
                      type="number"
                      min="0"
                      value={productInfo?.quantity || 0}
                      onChange={(e) =>
                        handleProductChange(
                          category.id,
                          "quantity",
                          Math.max(0, parseInt(e.target.value, 10) || 0)
                        )
                      }
                      disabled={!productInfo?.productId}
                    />
                  </td>
                  <td>
                    {(
                      (productInfo?.price || 0) * (productInfo?.quantity || 0)
                    ).toLocaleString()}{" "}
                    원
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>결제정보</h3>

        <PaymentTable
          payment={payments[0]}
          onPaymentChange={(updatedPayment) =>
            handlePaymentChange(0, updatedPayment)
          }
          customerName={customerName}
          isEdit={true}
          label="선입금"
        />

        <PaymentTable
          payment={payments[1]}
          onPaymentChange={(updatedPayment) =>
            handlePaymentChange(1, updatedPayment)
          }
          customerName={customerName}
          isEdit={true}
          label="잔금"
        />

        <div className={styles.calculator}>
          <div className={styles.spacebetween}>
            <h4 className={styles.sectionLabel}>상품 가격</h4>
            <p>{totalPrice.toLocaleString()} 원</p>
          </div>
          <div className={styles.spacebetween}>
            <h4 className={styles.sectionLabel}>선입금 총액</h4>
            <p className={styles.paid}>{prepaymentTotal.toLocaleString()} 원</p>
          </div>
          <div className={styles.spacebetween}>
            <h4 className={styles.sectionLabel}>잔금 총액</h4>
            <p className={styles.paid}>{balanceTotal.toLocaleString()} 원</p>
          </div>
          <hr className={styles.hr} />
          <div className={styles.spacebetween}>
            <h4 className={styles.sectionLabel}>총 잔액</h4>
            <p className={styles.rest}>
              {(totalPrice - prepaymentTotal - balanceTotal).toLocaleString()}{" "}
              원
            </p>
          </div>
        </div>
      </section>

      <section className={`${styles.sectionWrap} ${styles.alterationSection}`}>
        <h3 className={styles.sectionTitle}>수선정보</h3>
        {event?.form?.repairs &&
          chunk(event.form.repairs, 3).map((repairGroup, groupIndex) => (
            <div key={groupIndex} className={styles.sectionGroupWrap}>
              {repairGroup.map((repair) => (
                <div key={repair.id} className={styles.sectionVerticalGroup}>
                  <h4 className={styles.sectionLabel}>{repair.information}</h4>
                  <div className={styles.alterationInputGroup}>
                    {/* 최종 길이 입력 필드 */}
                    <div className={styles.inputWrapper}>
                      <label className={styles.inputLabel}>최종 길이</label>
                      <div className={styles.sectionGroup}>
                        <input
                          type="text"
                          className={styles.numberInput}
                          value={
                            formData.alteration_details.find(
                              (detail) => detail.form_repair_id === repair.id
                            )?.figure ?? 0
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            // 더 유연한 정규식 패턴 - 소수점 입력 과정 허용
                            const numberRegex = /^-?(\d*\.?\d*)?$/;

                            // 빈 문자열, 소수점, 또는 정규식에 맞는 입력 허용
                            if (
                              value === "" ||
                              value === "." ||
                              numberRegex.test(value)
                            ) {
                              handleAlterationChange(
                                repair.id,
                                "figure",
                                value
                              );
                            }
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value === "" || value === ".") {
                              handleAlterationChange(repair.id, "figure", 0);
                              return;
                            }
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              const formattedValue = parseFloat(
                                numValue.toFixed(1)
                              );
                              handleAlterationChange(
                                repair.id,
                                "figure",
                                formattedValue
                              );
                            }
                          }}
                        />
                        {repair.unit}
                      </div>
                    </div>

                    {/* 수선 길이 입력 필드 */}
                    <div className={styles.inputWrapper}>
                      <label className={styles.inputLabel}>수선 길이</label>
                      <div className={styles.sectionGroup}>
                        <input
                          type="text"
                          className={styles.numberInput}
                          value={
                            formData.alteration_details.find(
                              (detail) => detail.form_repair_id === repair.id
                            )?.alterationFigure ?? 0
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            // 더 유연한 정규식 패턴 - 음수와 소수점 입력 과정 허용
                            const numberRegex = /^-?(\d*\.?\d*)?$/;

                            // 빈 문자열, 마이너스, 소수점, 또는 정규식에 맞는 입력 허용
                            if (
                              value === "" ||
                              value === "-" ||
                              value === "." ||
                              value === "-." ||
                              numberRegex.test(value)
                            ) {
                              handleAlterationChange(
                                repair.id,
                                "alteration",
                                value
                              );
                            }
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (
                              value === "" ||
                              value === "-" ||
                              value === "." ||
                              value === "-."
                            ) {
                              handleAlterationChange(
                                repair.id,
                                "alteration",
                                0
                              );
                              return;
                            }
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              const formattedValue = parseFloat(
                                numValue.toFixed(1)
                              );
                              handleAlterationChange(
                                repair.id,
                                "alteration",
                                formattedValue
                              );
                            }
                          }}
                        />
                        {repair.unit}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

        <div className={styles.sectionValueWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>비고</h4>
            <textarea
              className={styles.optionalMessage}
              value={formData.alter_notes}
              onChange={(e) => handleAlterationChange("notes", e.target.value)}
            />
          </div>
        </div>
      </section>

      <Modal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        title="소속 선택 오류"
        message={affiliationError}
      />
    </>
  );
};

export default OrderForm;
