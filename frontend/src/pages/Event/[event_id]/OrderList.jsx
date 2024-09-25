import React, { useState, useCallback } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import styles from "./OrderList.module.css";
import { Filter, Pagination, Tab } from "../../../modules";
import { Button } from "../../../components";
import { ReactComponent as LeftArrow } from "../../../asset/icon/left_small.svg";
import { useEventDetails, useOrders } from "../../../api/hooks";

export const OrderList = () => {
  const { event_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialFilters = {
    search: "",
    status: "",
    order_date_from: null,
    order_date_to: null,
    is_temp: false,
    sort: "order_date_desc",
  };

  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: eventResponse,
    isLoading: eventLoading,
    error: eventError,
  } = useEventDetails(event_id);

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useOrders({
    ...filters,
    event_id,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    order_date_from: filters.order_date_from || undefined,
    order_date_to: filters.order_date_to || undefined,
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSort = useCallback((key) => {
    setFilters((prev) => ({
      ...prev,
      sort: prev.sort === `${key}_asc` ? `${key}_desc` : `${key}_asc`,
    }));
  }, []);

  const handleOrderStatusChange = useCallback((event, id) => {
    event.stopPropagation();
    // API call to update order status
    console.log(`Update order ${id} status to ${event.target.value}`);
  }, []);

  const handleRowClick = (event, order) => {
    if (event.target.tagName.toLowerCase() !== "select") {
      const isAdminRoute = location.pathname.includes("admin");
      if (isAdminRoute) {
        navigate(`/admin/order/${order.id}`);
      } else {
        navigate(`/event/${event_id}/${order.id}`);
      }
    }
  };

  const handleTabChange = (tabName) => {
    setFilters({
      ...initialFilters,
      is_temp: tabName === "tab2",
    });
    setCurrentPage(1);
  };

  const renderTable = (items) => (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">작성자</th>
          <th scope="col">주문자</th>
          <th scope="col">소속</th>
          <th scope="col">수령방법</th>
          <th scope="col">주문상태</th>
          <th
            scope="col"
            onClick={() => handleSort("order_date")}
            style={{ cursor: "pointer" }}
          >
            주문일자{" "}
            {filters.sort.includes("order_date") &&
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
            <td colSpan="10" className={styles.loadingMessageWrap}>
              주문서 데이터를 불러오는 중입니다...
            </td>
          </tr>
        ) : ordersError ? (
          <tr>
            <td colSpan="10" className={styles.errorMessageWrap}>
              주문서 데이터를 불러오는 데 실패했습니다.
              {ordersError.message && <p>오류 메시지: {ordersError.message}</p>}
            </td>
          </tr>
        ) : items.length === 0 ? (
          <tr>
            <td colSpan="10" className={styles.noDataMessageWrap}>
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
              <td>{order.author_id}</td>
              <td>{order.orderName}</td>
              <td>{order.affiliation_id}</td>
              <td>{order.collectionMethod}</td>
              <td>
                <select
                  name={`order_${order.id}`}
                  id={`order_${order.id}`}
                  className={styles.orderStatus}
                  value={order.status}
                  onChange={(event) => handleOrderStatusChange(event, order.id)}
                >
                  <option value="Order_Completed">주문완료</option>
                  <option value="Packaging_Completed">포장완료</option>
                  <option value="Repair_Received">수선접수</option>
                  <option value="Repair_Completed">수선완료</option>
                  <option value="In_delivery">배송중</option>
                  <option value="Delivery_completed">배송완료</option>
                  <option value="Receipt_completed">수령완료</option>
                  <option value="Accommodation">숙소</option>
                </select>
              </td>
              <td>{new Date(order.created_at).toLocaleDateString("ko-KR")}</td>
              <td>{order.totalPrice}</td>
              <td>{order.advancePayment}</td>
              <td>{order.orderName}</td>
              <td>{order.address}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const eventData = eventResponse?.data;
  const orders = ordersData?.data?.orders || [];

  return (
    <div className={styles.orderListTableBackground}>
      <section className={styles.tableWrap}>
        <div className={styles.tableTitleWrap}>
          <Link
            to={location.pathname.includes("admin") ? "/admin/event" : "/event"}
          >
            <LeftArrow />
          </Link>
          <h2 className={styles.tableTitle}>
            {eventLoading
              ? "Loading..."
              : eventError
              ? "이벤트 정보를 불러오는데 실패했습니다."
              : `[${eventData?.event_name}] 주문서 목록`}
          </h2>
        </div>
        <Tab defaultActiveTab="tab1" onTabChange={handleTabChange}>
          <Tab.TabPane name="tab1" tab="주문서 목록">
            <Filter filters={filters} setFilters={setFilters} />
            <div className={styles.actionButtonsWrap}>
              <Button label="Excel 저장" className={styles.excelButton} />
              <Link
                to={
                  location.pathname.includes("admin")
                    ? `/admin/event/${event_id}/create`
                    : `/event/${event_id}/create`
                }
                className={styles.newOrderLink}
              >
                주문서 작성
              </Link>
            </div>
            {renderTable(orders)}
            <Pagination
              className={styles.pagination}
              currentPage={currentPage}
              totalItems={ordersData?.data?.total || 0}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </Tab.TabPane>
          <Tab.TabPane name="tab2" tab="임시저장 목록">
            <Filter filters={filters} setFilters={setFilters} />
            <div className={styles.actionButtonsWrap}>
              <Button label="Excel 저장" className={styles.excelButton} />
              <Link
                to={`/event/${event_id}/create`}
                className={styles.newOrderLink}
              >
                주문서 작성
              </Link>
            </div>
            {renderTable(orders)}
            <Pagination
              className={styles.pagination}
              currentPage={currentPage}
              totalItems={ordersData?.data?.total || 0}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </Tab.TabPane>
        </Tab>
      </section>
    </div>
  );
};
