import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Input } from "../../components";
import PaymentTable from "./PaymentTable/PaymentTable";
import { Modal } from "../Modal";
import styles from "./OrderForm.module.css";
import {
  useAuthors,
  useAffiliations,
  useEventDetails,
  useCategories,
  useSaveOrder,
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

export const OrderCreateForm = ({ event_id, onSave, onComplete }) => {
  const { data: event, isLoading: isEventLoading } = useEventDetails(event_id);
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: authors, isLoading: isLoadingAuthors } = useAuthors();
  const { data: affiliations, isLoading: isLoadingAffiliations } =
    useAffiliations();
  const saveOrderMutation = useSaveOrder();

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
    status: "Order Completed",
    alteration_details: [], // 변경: 객체에서 배열로
    alter_notes: "", // 변경: notes를 별도 필드로
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

  // Memos
  const groupedProducts = useMemo(() => {
    if (!categories || !event) return {};
    const newGroupedProducts = {};
    orderCategories.forEach((category) => {
      newGroupedProducts[category.id] = category.products;
    });
    return newGroupedProducts;
  }, [categories, event, orderCategories]);

  // Effects
  useEffect(() => {
    if (event && categories) {
      const filteredCategories = categories.filter((category) =>
        event.form.categories.some(
          (formCategory) => formCategory.id === category.id
        )
      );
      setOrderCategories(filteredCategories);

      // 초기 alteration_details 설정
      if (event.form.repairs) {
        const initialAlterationDetails = event.form.repairs.map((repair) => ({
          form_repair_id: repair.id,
          figure: 0,
          alterationFigure: 0,
        }));
        setFormData((prev) => ({
          ...prev,
          alteration_details: initialAlterationDetails,
        }));
      }
    }
  }, [event, categories]);

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

  // Basic handlers
  const handleAuthorChange = (e) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      author_id: value ? parseInt(value, 10) : null,
    }));
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
        const numericValue = field === "figure" ? Math.max(0, value) : value;

        if (existingDetailIndex >= 0) {
          updatedDetails[existingDetailIndex] = {
            ...updatedDetails[existingDetailIndex],
            [field === "figure" ? "figure" : "alterationFigure"]: numericValue,
          };
        } else {
          updatedDetails.push({
            form_repair_id: repairId,
            figure: field === "figure" ? numericValue : 0,
            alterationFigure: field === "alteration" ? numericValue : 0,
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
    setCustomerName(newGroomName);
  }, []);

  const handleBrideNameChange = useCallback((e) => {
    const newBrideName = e.target.value;
    setFormData((prev) => ({ ...prev, brideName: newBrideName }));
  }, []);

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
      return newPayments;
    });

    // 각 결제 수단별 환산액 합계 계산
    const newTotal =
      (updatedPayment.cashAmount > 0 ? updatedPayment.cashConversion : 0) +
      (updatedPayment.cardAmount > 0 ? updatedPayment.cardConversion : 0) +
      (updatedPayment.tradeInAmount > 0 ? updatedPayment.tradeInConversion : 0);

    // 선입금/잔금 총액 업데이트
    if (index === 0) {
      setPrepaymentTotal(newTotal);
    } else {
      setBalanceTotal(newTotal);
    }
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

  const prepareOrderData = () => {
    const safeParseInt = (value) => {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? null : parsed;
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
        payment_date: payment.payment_date,
        paymentMethod: payment.paymentMethod.toLowerCase(),
        notes: payment.notes || "",
      };

      if (payment.cashAmount && payment.cashAmount > 0) {
        basePayment.cashAmount = payment.cashAmount;
        basePayment.cashCurrency = payment.cashCurrency;
        basePayment.cashConversion = payment.cashConversion;
      }

      if (payment.cardAmount && payment.cardAmount > 0) {
        basePayment.cardAmount = payment.cardAmount;
        basePayment.cardCurrency = payment.cardCurrency;
        basePayment.cardConversion = payment.cardConversion;
      }

      if (payment.tradeInAmount && payment.tradeInAmount > 0) {
        basePayment.tradeInAmount = payment.tradeInAmount;
        basePayment.tradeInCurrency = convertTradeInCurrency(
          payment.tradeInCurrency
        );
        basePayment.tradeInConversion = payment.tradeInConversion;
      }

      return basePayment;
    });

    const alterationDetails = formData.alteration_details.filter(
      (detail) => detail.figure !== 0 || detail.alterationFigure !== 0
    );

    return {
      event_id: safeParseInt(event_id),
      author_id: safeParseInt(formData.author_id),
      affiliation_id: safeParseInt(formData.affiliation_id),
      status: "Order_Completed",
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
  };

  const handleSubmit = async (isTemp = false) => {
    if (!validateAffiliation()) {
      return;
    }

    try {
      const orderData = prepareOrderData();
      await saveOrderMutation.mutateAsync({
        orderData,
        isTemp,
      });

      if (isTemp) {
        onSave?.();
      } else {
        onComplete?.();
      }
    } catch (error) {
      console.error("Order save failed:", error);
      alert(
        "주문 저장에 실패했습니다. 주문 저장 과정과 개발자 모드의 에러메시지를 개발자에게 전달해주시면 빠르게 도와드리겠습니다."
      );
    }
  };

  if (
    isLoadingAuthors ||
    isLoadingAffiliations ||
    isEventLoading ||
    isCategoriesLoading
  ) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>주문정보</h3>
        <div className={styles.sectionValueWrap}>
          <h4 className={styles.sectionLabel}>주문번호</h4>
          <p className={styles.sectionValue}>새 주문</p>
        </div>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionGroup}>
            <h4 className={styles.sectionLabel}>작성자</h4>
            <select
              name="author_id"
              id={styles.writer}
              onChange={handleAuthorChange}
              value={formData.author_id || ""}
            >
              <option value="">작성자 선택</option>
              {authors?.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.sectionGroup}>
            <h4 className={styles.sectionLabel}>작성일자</h4>
            <p className={styles.sectionValue}>
              {new Date().toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>
      </section>

      {/* 주문자정보 섹션 */}
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
              value={formData.contact}
              onChange={handleContactChange}
            />
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>소속</h4>
            <select
              name="affiliation_id"
              id={styles.relation}
              value={formData.affiliation_id || ""}
              onChange={handleAffiliationChange}
            >
              <option value="">소속 선택</option>
              {affiliations?.map((affiliation) => (
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
              value={formData.address}
              onChange={handleAddressChange}
            />
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>수령방법</h4>
            <select
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
              className={styles.optionalMessage}
              value={formData.notes}
              onChange={handleNotesChange}
            />
          </div>
        </div>
      </section>

      {/* 상품정보 섹션 */}
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

      {/* 결제정보 섹션 */}
      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>결제정보</h3>
        <PaymentTable
          payment={payments[0]}
          onPaymentChange={(updatedPayment) =>
            handlePaymentChange(0, updatedPayment)
          }
          customerName={customerName}
          isEdit={false}
          label="선입금"
        />
        <PaymentTable
          payment={payments[1]}
          onPaymentChange={(updatedPayment) =>
            handlePaymentChange(1, updatedPayment)
          }
          customerName={customerName}
          isEdit={false}
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
                            )?.figure ?? "0.0"
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            // 숫자, 소수점을 허용하는 정규식
                            const numberRegex = /^(\d*\.?\d*)?$/;

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
                              handleAlterationChange(
                                repair.id,
                                "figure",
                                parseFloat(numValue.toFixed(1))
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
                            )?.alterationFigure ?? "0.0"
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            // 숫자, 소수점, 음수 부호를 허용하는 정규식
                            const numberRegex = /^(-?\d*\.?\d*)?$/;

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
                              handleAlterationChange(
                                repair.id,
                                "alteration",
                                parseFloat(numValue.toFixed(1))
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

      <div className={styles.actionButtonsWrap}>
        <Button
          type="button"
          onClick={() => handleSubmit(true)}
          className={styles.tempSaveButton}
          variant="primary"
        >
          임시 저장
        </Button>
        <Button
          type="submit"
          className={styles.submitButton}
          onClick={() => handleSubmit(false)}
        >
          작성 완료
        </Button>
      </div>

      <Modal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="소속 선택 오류"
        message={affiliationError}
      />
    </>
  );
};

export default OrderCreateForm;
