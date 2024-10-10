import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Input } from "../../components";
import PaymentTable from "./PaymentTable/PaymentTable";
import { Modal } from "../Modal";
import styles from "./OrderForm.module.css";
import {
  useSaveOrder,
  useSaveTempOrder,
  useOrderDetails,
  useAuthors,
  useAffiliations,
  useEventDetails,
  useCategories,
} from "../../api/hooks";

const ORDER_STATUS_MAP = {
  Order_Completed: "주문완료",
  Packaging_Completed: "포장완료",
  Repair_Received: "수선접수",
  Repair_Completed: "수선완료",
  In_delivery: "배송중",
  Delivery_completed: "배송완료",
  Receipt_completed: "수령완료",
  Accommodation: "숙소",
};

const convertStatusToApiFormat = (status) => {
  return status.replace(/ /g, "_");
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

  console.log(orderData?.data);

  const [formData, setFormData] = useState({
    event_id: event_id,
    author_id: null,
    affiliation_id: null,
    orderName: "",
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
      jacketSleeve: 0,
      jacketLength: 0,
      jacketForm: 0,
      pantsCircumference: 0,
      pantsLength: 0,
      shirtNeck: 0,
      shirtSleeve: 0,
      dressBackForm: 0,
      dressLength: 0,
      notes: "",
    },
  });

  const [selectedProducts, setSelectedProducts] = useState({});
  const [orderCategories, setOrderCategories] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [payerName, setPayerName] = useState("");
  const [isPayerSameAsCustomer, setIsPayerSameAsCustomer] = useState(false);
  const [affiliationError, setAffiliationError] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [prepaymentTotal, setPrepaymentTotal] = useState(0);
  const [balanceTotal, setBalanceTotal] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [payments, setPayments] = useState([
    {
      payment_date: null,
      paymentMethod: "advance",
      cashAmount: 0,
      cashCurrency: "KRW",
      cardAmount: 0,
      cardCurrency: "KRW",
      tradeInAmount: 0,
      tradeInCurrency: "",
      notes: "",
    },
    {
      payment_date: null,
      paymentMethod: "balance",
      cashAmount: 0,
      cashCurrency: "KRW",
      cardAmount: 0,
      cardCurrency: "KRW",
      tradeInAmount: 0,
      tradeInCurrency: "",
      notes: "",
    },
  ]);

  const groupedProducts = useMemo(() => {
    if (!categories?.data || !event?.data) return {};
    const newGroupedProducts = {};
    orderCategories.forEach((category) => {
      newGroupedProducts[category.id] = category.products;
    });
    return newGroupedProducts;
  }, [categories, event, orderCategories]);

  useEffect(() => {
    if (orderData?.data && categories?.data) {
      const orderDetails = orderData.data;
      setFormData((prev) => ({
        ...prev,
        ...orderDetails,
        status: convertStatusFromApiFormat(orderDetails.status),
        alteration_details: orderDetails.alteration_details[0] || {},
        author_id: orderDetails.author_id || "",
        modifier_id: orderDetails.modifier_id || "",
      }));

      setCustomerName(orderDetails.orderName);
      setPayerName(orderDetails.payments[0]?.payer || "");
      setIsPayerSameAsCustomer(
        orderDetails.orderName === orderDetails.payments[0]?.payer
      );
      setPrepaymentTotal(orderDetails.advancePayment);
      setBalanceTotal(orderDetails.balancePayment);
      setTotalPrice(orderDetails.totalPrice);

      // Filter categories based on orderDetails.form.categories
      const filteredCategories = categories.data.filter((category) =>
        orderDetails.form.categories.some(
          (formCategory) => formCategory.id === category.id
        )
      );
      setOrderCategories(filteredCategories);

      const newSelectedProducts = {};
      orderDetails.orderItems.forEach((item) => {
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
      setSelectedProducts(newSelectedProducts);

      setPayments(
        orderDetails.payments.map((payment) => ({
          ...payment,
          paymentMethod: payment.paymentMethod.toLowerCase(),
        }))
      );
    }
  }, [orderData, categories]);

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
    setFormData((prev) => ({
      ...prev,
      alteration_details: {
        ...prev.alteration_details,
        [field]: value,
      },
    }));
  };

  const handleCustomerNameChange = useCallback(
    (e) => {
      setCustomerName(e.target.value);
      setFormData((prev) => ({ ...prev, orderName: e.target.value }));
      if (isPayerSameAsCustomer) {
        setPayerName(e.target.value);
      }
    },
    [isPayerSameAsCustomer]
  );

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
                id: attr.attribute_id,
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
          newState[categoryId] = {
            ...newState[categoryId],
            attributes: [{ id: value.id, value: value.value }],
          };
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
      newPayments[index] = updatedPayment;
      return newPayments;
    });

    if (updatedPayment.paymentMethod === "advance") {
      setPrepaymentTotal(updatedPayment.totalConvertedAmount || 0);
    } else if (updatedPayment.paymentMethod === "balance") {
      setBalanceTotal(updatedPayment.totalConvertedAmount || 0);
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

  const prepareOrderData = useCallback(() => {
    const safeParseInt = (value) => {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? null : parsed;
    };

    const orderItems = Object.values(selectedProducts)
      .filter((item) => item.productId)
      .map((item) => ({
        product_id: safeParseInt(item.productId),
        attributes_id: item.attributes[0]?.id || null,
        quantity: safeParseInt(item.quantity) || 0,
        price: item.price * (safeParseInt(item.quantity) || 0),
      }));

    const convertTradeInCurrency = (currency) => {
      const currencyMap = {
        "10K": "K10",
        "14K": "K14",
        "18K": "K18",
        "24K": "K24",
      };
      return currencyMap[currency] || currency;
    };

    const paymentsData = payments.map((payment) => ({
      payer: payment.payerName || customerName,
      payment_date: payment.payment_date || new Date().toISOString(),
      cashAmount: safeParseInt(payment.cashAmount) || null,
      cashCurrency: payment.cashAmount ? payment.cashCurrency : null,
      cardAmount: safeParseInt(payment.cardAmount) || null,
      cardCurrency: payment.cardAmount ? payment.cardCurrency : null,
      tradeInAmount: payment.tradeInAmount
        ? safeParseInt(payment.tradeInAmount)
        : null,
      tradeInCurrency: payment.tradeInAmount
        ? convertTradeInCurrency(payment.tradeInCurrency)
        : null,
      paymentMethod: payment.paymentMethod.toUpperCase(),
      notes: payment.notes || "",
    }));

    return {
      ...formData,
      event_id: safeParseInt(event_id),
      author_id: safeParseInt(formData.author_id),
      modifier_id: safeParseInt(formData.modifier_id),
      affiliation_id: safeParseInt(formData.affiliation_id),
      status: convertStatusToApiFormat(formData.status),
      totalPrice: totalPrice,
      advancePayment: prepaymentTotal,
      balancePayment: balanceTotal,
      orderItems: orderItems,
      payments: paymentsData,
    };
  }, [
    formData,
    selectedProducts,
    payments,
    customerName,
    totalPrice,
    prepaymentTotal,
    balanceTotal,
    event_id,
  ]);

  useEffect(() => {
    if (onSave) {
      onSave(() => prepareOrderData);
    }
  }, [onSave, prepareOrderData]);

  useEffect(() => {
    if (onSave) {
      onSave(prepareOrderData);
    }
  }, [onSave, prepareOrderData]);

  if (
    isLoadingOrderDetails ||
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
              {authors?.data &&
                authors?.data.map((author) => (
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
              {authors?.data &&
                authors?.data.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
            </select>
          </div>
          <div className={styles.sectionGroup}>
            <h4 className={styles.sectionLabel}>작성일자</h4>
            <p className={styles.sectionValue}>
              {new Date(orderData?.data.created_at).toLocaleDateString("ko-KR")}
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
            <h4 className={styles.sectionLabel}>주문자</h4>
            <Input
              type="text"
              className={styles.textInput}
              value={customerName}
              onChange={handleCustomerNameChange}
            />
          </div>
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
              {affiliations?.data &&
                affiliations?.data.map((affiliation) => (
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
                        value={productInfo?.attributes?.[0]?.value || ""}
                        onChange={(e) =>
                          handleProductChange(category.id, "attributes", {
                            id: selectedProduct?.attributes?.[0]?.attribute_id,
                            value: e.target.value,
                          })
                        }
                      >
                        <option value="">선택</option>
                        {selectedProduct?.attributes?.map((attr) => (
                          <option key={attr.attribute_id} value={attr.value}>
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

        {payments.map((payment, index) => (
          <PaymentTable
            key={index}
            payment={payment}
            onPaymentChange={(updatedPayment) =>
              handlePaymentChange(index, updatedPayment)
            }
            customerName={customerName}
            isEdit={true}
          />
        ))}

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

      <section className={styles.sectionWrap}>
        <h3 className={styles.sectionTitle}>수선정보</h3>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>자켓 소매</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="jacketSleeve"
                value={formData.alteration_details.jacketSleeve}
                onChange={(e) =>
                  handleAlterationChange("jacketSleeve", e.target.value)
                }
              />
              {event?.data?.form.jacketSleeve}
            </div>
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>자켓 기장</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="jacketLength"
                value={formData.alteration_details.jacketLength}
                onChange={(e) =>
                  handleAlterationChange("jacketLength", e.target.value)
                }
              />
              {event?.data?.form.jacketLength}
            </div>
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>자켓 폼</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="jacketForm"
                value={formData.alteration_details.jacketForm}
                onChange={(e) =>
                  handleAlterationChange("jacketForm", e.target.value)
                }
              />
              {event?.data?.form.jacketForm}
            </div>
          </div>
        </div>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>셔츠 목</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="shirtNeck"
                value={formData.alteration_details.shirtNeck}
                onChange={(e) =>
                  handleAlterationChange("shirtNeck", e.target.value)
                }
              />
              {event?.data?.form.shirtNeck}
            </div>
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>셔츠 소매</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="shirtSleeve"
                value={formData.alteration_details.shirtSleeve}
                onChange={(e) =>
                  handleAlterationChange("shirtSleeve", e.target.value)
                }
              />
              {event?.data?.form.shirtSleeve}
            </div>
          </div>
        </div>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>바지 둘레</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="pantsCircumference"
                value={formData.alteration_details.pantsCircumference}
                onChange={(e) =>
                  handleAlterationChange("pantsCircumference", e.target.value)
                }
              />
              {event?.data?.form.pantsCircumference}
            </div>
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>바지 길이</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="pantsLength"
                value={formData.alteration_details.pantsLength}
                onChange={(e) =>
                  handleAlterationChange("pantsLength", e.target.value)
                }
              />
              {event?.data?.form.pantsLength}
            </div>
          </div>
        </div>

        <div className={styles.sectionGroupWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>드레스 뒷품</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="dressBackForm"
                value={formData.alteration_details.dressBackForm}
                onChange={(e) =>
                  handleAlterationChange("dressBackForm", e.target.value)
                }
              />
              {event?.data?.form.dressBackForm}
            </div>
          </div>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>드레스 기장</h4>
            <div className={styles.sectionGroup}>
              <input
                type="number"
                className={styles.numberInput}
                name="dressLength"
                value={formData.alteration_details.dressLength}
                onChange={(e) =>
                  handleAlterationChange("dressLength", e.target.value)
                }
              />
              {event?.data?.form.dressLength}
            </div>
          </div>
        </div>

        <div className={styles.sectionValueWrap}>
          <div className={styles.sectionVerticalGroup}>
            <h4 className={styles.sectionLabel}>비고</h4>
            <textarea
              name="alterationNotes"
              id="dressOptionalMessage"
              className={styles.optionalMessage}
              value={formData.alteration_details.notes}
              onChange={(e) => handleAlterationChange("notes", e.target.value)}
            ></textarea>
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
