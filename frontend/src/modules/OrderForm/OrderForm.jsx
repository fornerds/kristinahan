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

  console.log(orderData);

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
    alteration_details: {
      notes: "",
    },
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
      cardAmount: 0,
      cardCurrency: "KRW",
      tradeInAmount: 0,
      tradeInCurrency: "",
      notes: "",
      totalConvertedAmount: 0,
      payerName: "",
    },
    {
      payment_date: new Date().toISOString(),
      paymentMethod: "BALANCE",
      cashAmount: 0,
      cashCurrency: "KRW",
      cardAmount: 0,
      cardCurrency: "KRW",
      tradeInAmount: 0,
      tradeInCurrency: "",
      notes: "",
      totalConvertedAmount: 0,
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

      if (payment.cashAmount && payment.cashAmount > 0) {
        basePayment.cashAmount = safeParseInt(payment.cashAmount);
        basePayment.cashCurrency = payment.cashCurrency;
      }

      if (payment.cardAmount && payment.cardAmount > 0) {
        basePayment.cardAmount = safeParseInt(payment.cardAmount);
        basePayment.cardCurrency = payment.cardCurrency;
      }

      if (payment.tradeInAmount && payment.tradeInAmount > 0) {
        basePayment.tradeInAmount = safeParseInt(payment.tradeInAmount);
        basePayment.tradeInCurrency = convertTradeInCurrency(
          payment.tradeInCurrency
        );
      }

      return basePayment;
    });

    // Update alteration_details to new format
    const alterationDetails = event?.form?.repairs
      ?.map((repair) => {
        const figureValue =
          formData.alteration_details[`${repair.type}_figure`] || 0;
        const alterationValue =
          formData.alteration_details[`${repair.type}_alteration`] || 0;

        return {
          form_repair_id: repair.id,
          figure: safeParseFloat(figureValue),
          alterationFigure: safeParseFloat(alterationValue),
        };
      })
      .filter((detail) => detail.figure !== 0 || detail.alterationFigure !== 0);

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
      alter_notes: formData.alteration_details.notes || "",
      totalPrice: totalPrice,
      advancePayment: prepaymentTotal,
      balancePayment: balanceTotal,
      orderItems: orderItems,
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
      console.log("Initial payment data:", orderData.payments); // 추가된 로그

      // 결제 정보 초기화
      const advancePayment = orderData.payments.find(
        (p) => p.paymentMethod === "advance"
      );
      const balancePayment = orderData.payments.find(
        (p) => p.paymentMethod === "balance"
      );

      console.log("Found payments:", { advancePayment, balancePayment });

      const calculateInitialConvertedAmount = (payment) => {
        if (payment?.totalConvertedAmount) {
          return payment.totalConvertedAmount;
        }
        return (
          (Number(payment?.cashConvertedAmount) || 0) +
          (Number(payment?.cardConvertedAmount) || 0) +
          (Number(payment?.tradeInConvertedAmount) || 0)
        );
      };

      // alteration details 초기화
      const alterationDetailsObj = {
        notes: orderData.alter_notes || "",
      };

      if (event?.form?.repairs) {
        event.form.repairs.forEach((repair) => {
          const detail = orderData.alteration_details?.find(
            (d) => d.form_repair_id === repair.id
          );
          alterationDetailsObj[`${repair.type}_figure`] = detail?.figure || 0;
          alterationDetailsObj[`${repair.type}_alteration`] =
            detail?.alterationFigure || 0;
        });
      }

      // 상품 정보 초기화
      const filteredCategories = categories.filter((category) =>
        orderData.form.categories.some(
          (formCategory) => formCategory.id === category.id
        )
      );

      const newSelectedProducts = {};
      orderData.orderItems.forEach((item) => {
        const category = filteredCategories.find((cat) =>
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
          ...advancePayment,
          payment_date:
            advancePayment?.payment_date || new Date().toISOString(),
          paymentMethod: "ADVANCE",
          cashAmount: Number(advancePayment?.cashAmount) || 0,
          cashCurrency: advancePayment?.cashCurrency || "KRW",
          cardAmount: Number(advancePayment?.cardAmount) || 0,
          cardCurrency: advancePayment?.cardCurrency || "KRW",
          tradeInAmount: Number(advancePayment?.tradeInAmount) || 0,
          tradeInCurrency: advancePayment?.tradeInCurrency || "",
          notes: advancePayment?.notes || "",
          payer: advancePayment?.payer || "",
          payerName: advancePayment?.payer || "",
          cashConvertedAmount: Number(advancePayment?.cashConvertedAmount) || 0,
          cardConvertedAmount: Number(advancePayment?.cardConvertedAmount) || 0,
          tradeInConvertedAmount:
            Number(advancePayment?.tradeInConvertedAmount) || 0,
          totalConvertedAmount: calculateInitialConvertedAmount(advancePayment),
        },
        {
          ...balancePayment,
          payment_date:
            balancePayment?.payment_date || new Date().toISOString(),
          paymentMethod: "BALANCE",
          cashAmount: Number(balancePayment?.cashAmount) || 0,
          cashCurrency: balancePayment?.cashCurrency || "KRW",
          cardAmount: Number(balancePayment?.cardAmount) || 0,
          cardCurrency: balancePayment?.cardCurrency || "KRW",
          tradeInAmount: Number(balancePayment?.tradeInAmount) || 0,
          tradeInCurrency: balancePayment?.tradeInCurrency || "",
          notes: balancePayment?.notes || "",
          payer: balancePayment?.payer || "",
          payerName: balancePayment?.payer || "",
          cashConvertedAmount: Number(balancePayment?.cashConvertedAmount) || 0,
          cardConvertedAmount: Number(balancePayment?.cardConvertedAmount) || 0,
          tradeInConvertedAmount:
            Number(balancePayment?.tradeInConvertedAmount) || 0,
          totalConvertedAmount: calculateInitialConvertedAmount(balancePayment),
        },
      ];

      console.log("Setting initial payments:", initialPayments);

      // 모든 상태 한번에 업데이트
      setPayments(initialPayments);
      setPrepaymentTotal(calculateInitialConvertedAmount(advancePayment));
      setBalanceTotal(calculateInitialConvertedAmount(balancePayment));
      setFormData((prev) => ({
        ...prev,
        ...orderData,
        status: convertStatusFromApiFormat(orderData.status),
        alteration_details: alterationDetailsObj,
        author_id: orderData.author_id || "",
        modifier_id: orderData.modifier_id || "",
      }));
      setOrderCategories(filteredCategories);
      setSelectedProducts(newSelectedProducts);
      setTotalPrice(orderData.totalPrice || 0);
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

  const handleAlterationChange = (field, value) => {
    if (field === "notes") {
      setFormData((prev) => ({
        ...prev,
        alteration_details: {
          ...prev.alteration_details,
          notes: value,
        },
        alter_notes: value,
      }));
    } else {
      setFormData((prev) => {
        const currentDetails = { ...prev.alteration_details };
        const [repairType, fieldType] = field.split("_");

        if (fieldType === "figure" || fieldType === "alteration") {
          currentDetails[field] = parseFloat(parseFloat(value).toFixed(1));
        }

        return {
          ...prev,
          alteration_details: currentDetails,
        };
      });
    }
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
    // 각 지급 방법별 환산액 계산
    const cashConverted = updatedPayment.cashConvertedAmount || 0;
    const cardConverted = updatedPayment.cardConvertedAmount || 0;
    const tradeInConverted = updatedPayment.tradeInConvertedAmount || 0;

    // 원화환산액 총액 계산
    const totalConverted = cashConverted + cardConverted + tradeInConverted;

    // payments 상태 업데이트
    setPayments((prev) => {
      const newPayments = [...prev];
      newPayments[index] = {
        ...updatedPayment,
        totalConvertedAmount: totalConverted,
      };
      return newPayments;
    });

    // 선입금/잔금 총액 업데이트
    if (index === 0) {
      setPrepaymentTotal(totalConverted);
    } else {
      setBalanceTotal(totalConverted);
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
      console.log(prepareOrderData);
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
          <p className={styles.sectionValue}>{formData.id}</p>
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
            <p className={styles.paid}>
              {payments[0].totalConvertedAmount?.toLocaleString() || 0} 원
            </p>
          </div>
          <div className={styles.spacebetween}>
            <h4 className={styles.sectionLabel}>잔금 총액</h4>
            <p className={styles.paid}>
              {payments[1].totalConvertedAmount?.toLocaleString() || 0} 원
            </p>
          </div>
          <hr className={styles.hr} />
          <div className={styles.spacebetween}>
            <h4 className={styles.sectionLabel}>총 잔액</h4>
            <p className={styles.rest}>
              {(
                totalPrice -
                (payments[0].totalConvertedAmount || 0) -
                (payments[1].totalConvertedAmount || 0)
              ).toLocaleString()}{" "}
              원
            </p>
          </div>
        </div>
      </section>

      <section className={styles.sectionWrap}>
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
                          type="number"
                          className={styles.numberInput}
                          step="0.1"
                          min="0"
                          value={(
                            formData.alteration_details[
                              `${repair.type}_figure`
                            ] || 0
                          ).toFixed(1)}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || isNaN(value)) {
                              handleAlterationChange(
                                `${repair.type}_figure`,
                                0
                              );
                              return;
                            }
                            const numValue = parseFloat(
                              parseFloat(value).toFixed(1)
                            );
                            handleAlterationChange(
                              `${repair.type}_figure`,
                              numValue
                            );
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
                          type="number"
                          className={styles.numberInput}
                          step="0.1"
                          value={(
                            formData.alteration_details[
                              `${repair.type}_alteration`
                            ] || 0
                          ).toFixed(1)}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || isNaN(value)) {
                              handleAlterationChange(
                                `${repair.type}_alteration`,
                                0
                              );
                              return;
                            }
                            const numValue = parseFloat(
                              parseFloat(value).toFixed(1)
                            );
                            handleAlterationChange(
                              `${repair.type}_alteration`,
                              numValue
                            );
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
              value={formData.alteration_details.notes}
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
