import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import styles from "./OrderList.module.css";
import { Filter, Pagination, Tab } from "../../../modules";
import { Button } from "../../../components";
import { ReactComponent as LeftArrow } from "../../../asset/icon/left_small.svg";
import {
  useEventDetails,
  useOrders,
  useAuthors,
  useAffiliations,
  useUpdateOrderStatus,
  useDownloadOrders,
} from "../../../api/hooks";

const formatOrderStatus = (status) => {
  const statusMap = {
    "Order Completed": "주문완료",
    "Packaging Completed": "포장완료",
    "Repair Received": "수선접수",
    "Repair Completed": "수선완료",
    "In delivery": "배송중",
    "Delivery completed": "배송완료",
    "Receipt completed": "수령완료",
    Accommodation: "숙소",
  };
  return statusMap[status] || status;
};

const getCollectionMethod = (method) => {
  switch (method) {
    case "Delivery":
      return "배송";
    case "Pickup on site":
      return "현장수령";
    case "Pickup in store":
      return "매장수령";
    default:
      return method;
  }
};

export const OrderList = () => {
  const { event_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    order_date_from: null,
    order_date_to: null,
    is_temp: false,
    sort: "order_date_desc",
    event_name: "",
  });

  const itemsPerPage = 10;

  const { data: eventResponse, isLoading: eventLoading } = useEventDetails(
    event_id,
    {
      enabled: !!event_id,
    }
  );

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useOrders(
    {
      ...filters,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    },
    {
      enabled: !!event_id && !!filters.event_name,
    }
  );

  const { data: authorsData } = useAuthors();
  const { data: affiliationsData } = useAffiliations();
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const downloadOrdersMutation = useDownloadOrders();

  const authors = useMemo(
    () =>
      authorsData?.reduce(
        (acc, author) => ({ ...acc, [author.id]: author.name }),
        {}
      ) || {},
    [authorsData]
  );

  const affiliations = useMemo(
    () =>
      affiliationsData?.reduce(
        (acc, affiliation) => ({ ...acc, [affiliation.id]: affiliation.name }),
        {}
      ) || {},
    [affiliationsData]
  );

  // event_id 변경 시 필터 초기화
  useEffect(() => {
    if (event_id) {
      setCurrentPage(1);
      setFilters((prev) => ({
        search: "",
        status: "",
        order_date_from: null,
        order_date_to: null,
        is_temp: false,
        sort: "order_date_desc",
        event_name: prev.event_name,
      }));
    }
  }, [event_id]);

  // eventResponse 변경 시 event_name 업데이트
  useEffect(() => {
    if (eventResponse?.name) {
      console.log("Updating event_name from response:", eventResponse.name);
      setFilters((prev) => ({
        ...prev,
        event_name: eventResponse.name,
      }));
    }
  }, [eventResponse]);

  // filters 변경 추적을 위한 디버깅
  useEffect(() => {
    console.log("Filters changed:", filters);
  }, [filters]);

  const handleExcelDownload = useCallback(() => {
    downloadOrdersMutation.mutate({
      ...filters,
      limit: ordersData?.total || 0,
      offset: 0,
    });
  }, [downloadOrdersMutation, filters, ordersData?.total]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSort = useCallback((key) => {
    setFilters((prev) => ({
      ...prev,
      sort: prev.sort === `${key}_asc` ? `${key}_desc` : `${key}_asc`,
    }));
  }, []);

  const handleOrderStatusChange = useCallback(
    (event, orderId) => {
      event.stopPropagation();
      const newStatus = event.target.value;
      updateOrderStatusMutation.mutate(
        { orderId, status: newStatus },
        {
          onSuccess: () => {
            console.log(`Order ${orderId} status updated to ${newStatus}`);
          },
          onError: (error) => {
            console.error("Failed to update order status:", error);
            alert("주문 상태 업데이트에 실패했습니다. 다시 시도해주세요.");
          },
        }
      );
    },
    [updateOrderStatusMutation]
  );

  const handleRowClick = useCallback(
    (event, order) => {
      if (event.target.tagName.toLowerCase() !== "select") {
        navigate(`/event/${event_id}/${order.id}`);
      }
    },
    [navigate, event_id]
  );

  const handleTabChange = (tabName) => {
    setFilters((prev) => ({
      ...prev,
      is_temp: tabName === "tab2",
    }));
    setCurrentPage(1);
  };

  const renderTable = (items) => (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">작성자</th>
          <th scope="col">신랑</th>
          <th scope="col">신부</th>
          <th scope="col">소속</th>
          <th scope="col">수령방법</th>
          <th scope="col">주문상태</th>
          <th
            scope="col"
            onClick={() => handleSort("order_date")}
            style={{ cursor: "pointer" }}
          >
            주문일자{" "}
            {filters.sort &&
              filters.sort.includes("order_date") &&
              (filters.sort === "order_date_asc" ? "▲" : "▼")}
          </th>
          <th scope="col">총주문금액</th>
          <th scope="col">총결제금액</th>
          <th scope="col">결제자</th>
          <th scope="col">주소지</th>
        </tr>
      </thead>
      <tbody>
        {ordersLoading ? (
          <tr>
            <td colSpan="11" className={styles.loadingMessageWrap}>
              데이터를 불러오는 중입니다...
            </td>
          </tr>
        ) : ordersError ? (
          <tr>
            <td colSpan="11" className={styles.errorMessageWrap}>
              주문서 데이터를 불러오는 데 실패했습니다.
              {ordersError.message && <p>오류 메시지: {ordersError.message}</p>}
            </td>
          </tr>
        ) : items.length === 0 ? (
          <tr>
            <td colSpan="11" className={styles.noDataMessageWrap}>
              조회된 주문서가 없습니다.
            </td>
          </tr>
        ) : (
          items.map((order) => (
            <tr
              key={order.id}
              onClick={(event) => handleRowClick(event, order)}
              className={styles.orderLink}
            >
              <td>{authors[order.author_id] || order.author_id || "-"}</td>
              <td>{order.groomName || "-"}</td>
              <td>{order.brideName || "-"}</td>
              <td>
                {affiliations[order.affiliation_id] ||
                  order.affiliation_id ||
                  "-"}
              </td>
              <td>{getCollectionMethod(order.collectionMethod)}</td>
              <td>
                <select
                  name={`order_${order.id}`}
                  className={styles.orderStatus}
                  value={order.status}
                  onChange={(event) => handleOrderStatusChange(event, order.id)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="Order Completed">주문완료</option>
                  <option value="Packaging Completed">포장완료</option>
                  <option value="Repair Received">수선접수</option>
                  <option value="Repair Completed">수선완료</option>
                  <option value="In delivery">배송중</option>
                  <option value="Delivery completed">배송완료</option>
                  <option value="Receipt completed">수령완료</option>
                  <option value="Accommodation">숙소</option>
                </select>
              </td>
              <td>{new Date(order.created_at).toLocaleDateString("ko-KR")}</td>
              <td>{order.totalPrice || "-"}</td>
              <td>{order.advancePayment || "-"}</td>
              <td>{order.payerName || "-"}</td>
              <td>{order.address || "-"}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  return (
    <div className={styles.orderListTableBackground}>
      <section className={styles.tableWrap}>
        <div className={styles.tableTitleWrap}>
          <Link to="/event">
            <LeftArrow />
          </Link>
          <h2 className={styles.tableTitle}>
            {eventLoading
              ? "Loading..."
              : !eventResponse
              ? "이벤트 정보를 불러오는데 실패했습니다."
              : `[${eventResponse.name}] 주문서 목록`}
          </h2>
        </div>
        <Tab defaultActiveTab="tab1" onTabChange={handleTabChange}>
          <Tab.TabPane name="tab1" tab="주문서 목록">
            <Filter
              filters={filters}
              setFilters={setFilters}
              isAdminPage={false}
              currentEventName={eventResponse?.name || ""}
            />
            <div className={styles.actionButtonsWrap}>
              <Button
                label="Excel 저장"
                className={styles.excelButton}
                onClick={handleExcelDownload}
                disabled={downloadOrdersMutation.isLoading}
              />
              <Link
                to={`/event/${event_id}/create`}
                className={styles.newOrderLink}
              >
                주문서 작성
              </Link>
            </div>
            {renderTable(ordersData?.orders || [])}
            <Pagination
              className={styles.pagination}
              currentPage={currentPage}
              totalItems={ordersData?.total || 0}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </Tab.TabPane>
          <Tab.TabPane name="tab2" tab="임시저장 목록">
            <Filter
              filters={filters}
              setFilters={setFilters}
              isAdminPage={false}
              currentEventName={eventResponse?.name || ""}
            />
            <div className={styles.actionButtonsWrap}>
              <Button
                label="Excel 저장"
                className={styles.excelButton}
                onClick={handleExcelDownload}
                disabled={downloadOrdersMutation.isLoading}
              />
              <Link
                to={`/event/${event_id}/create`}
                className={styles.newOrderLink}
              >
                주문서 작성
              </Link>
            </div>
            {renderTable(ordersData?.orders || [])}
            <Pagination
              className={styles.pagination}
              currentPage={currentPage}
              totalItems={ordersData?.total || 0}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </Tab.TabPane>
        </Tab>
      </section>
    </div>
  );
};
