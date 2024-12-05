import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./OrderList.module.css";
import {
  EventSelectionModal,
  Filter,
  Pagination,
  Tab,
  TabNavigation,
} from "../../../modules";
import { Button } from "../../../components";
import {
  useCurrentEvents,
  useOrders,
  useAuthors,
  useAffiliations,
  useUpdateOrderStatus,
  useDownloadOrders,
} from "../../../api/hooks";

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
  const navigate = useNavigate();
  const [isEventSelectionModalOpen, setIsEventSelectionModalOpen] =
    useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const initialFilters = {
    search: "",
    status: "",
    order_date_from: null,
    order_date_to: null,
    is_temp: false,
    event_name: "",
    sort: "order_date_desc",
  };

  const [filters, setFilters] = useState(initialFilters);

  const itemsPerPage = 10;

  // 데이터 fetching hooks
  const { data: events } = useCurrentEvents();
  const { data: ordersData, isLoading: ordersLoading } = useOrders(
    {
      ...filters,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    },
    {
      enabled: true,
      refetchOnWindowFocus: false,
    }
  );
  const { data: authorsData } = useAuthors();
  const { data: affiliationsData } = useAffiliations();
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const downloadOrdersMutation = useDownloadOrders();

  // 데이터 변환 메모이제이션
  const authors = useMemo(
    () =>
      authorsData?.reduce(
        (acc, author) => ({
          ...acc,
          [author.id]: author.name,
        }),
        {}
      ) || {},
    [authorsData]
  );

  const affiliations = useMemo(
    () =>
      affiliationsData?.reduce(
        (acc, affiliation) => ({
          ...acc,
          [affiliation.id]: affiliation.name,
        }),
        {}
      ) || {},
    [affiliationsData]
  );

  const orders = ordersData?.orders || [];
  const total = ordersData?.total || 0;

  // filters 변경 모니터링
  useEffect(() => {
    console.log("Filters changed:", filters);
  }, [filters]);

  // Event Handlers
  const handleEventSelection = useCallback(
    (eventId, eventName) => {
      navigate(`/admin/order/create/${eventId}`);
      setIsEventSelectionModalOpen(false);
    },
    [navigate]
  );

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleSort = useCallback((key) => {
    setFilters((prev) => ({
      ...prev,
      sort: prev.sort === `${key}_asc` ? `${key}_desc` : `${key}_asc`,
    }));
  }, []);

  const handleOrderStatusChange = useCallback(
    async (event, orderId) => {
      event.stopPropagation();
      const newStatus = event.target.value;
      try {
        await updateOrderStatusMutation.mutateAsync({
          orderId,
          status: newStatus,
        });
      } catch (error) {
        console.error("Failed to update order status:", error);
        alert("주문 상태 업데이트에 실패했습니다. 다시 시도해주세요.");
      }
    },
    [updateOrderStatusMutation]
  );

  const handleExcelDownload = useCallback(async () => {
    try {
      await downloadOrdersMutation.mutateAsync(filters);
    } catch (error) {
      console.error("Excel download failed:", error);
      alert("엑셀 다운로드에 실패했습니다. 다시 시도해주세요.");
    }
  }, [downloadOrdersMutation, filters]);

  const handleTabChange = useCallback((tabName) => {
    setFilters((prev) => ({
      ...initialFilters,
      event_name: prev.event_name, // 이벤트 이름 유지
      is_temp: tabName === "tab2",
    }));
    setCurrentPage(1);
  }, []);

  const handleRowClick = useCallback(
    (order) => {
      navigate(`/admin/order/${order.event_id}/${order.id}`);
    },
    [navigate]
  );

  const renderTable = useCallback(
    (items) => (
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">ID</th>
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
              {filters.sort?.includes("order_date") &&
                (filters.sort === "order_date_asc" ? "▲" : "▼")}
            </th>
            <th scope="col">총주문금액</th>
            <th scope="col">총결제금액</th>
            <th scope="col">결제자</th>
            <th scope="col">주소지</th>
            <th scope="col">행사</th>
          </tr>
        </thead>
        <tbody>
          {ordersLoading ? (
            <tr>
              <td colSpan="12" className={styles.loadingMessageWrap}>
                데이터를 불러오는 중입니다...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan="12" className={styles.noDataMessageWrap}>
                조회된 주문서가 없습니다.
              </td>
            </tr>
          ) : (
            items.map((order) => (
              <tr
                key={order.id}
                onClick={() => handleRowClick(order)}
                className={styles.orderLink}
              >
                <td>{order.id || "-"}</td>
                <td>{authors?.[order.author_id] || order.author_id || "-"}</td>
                <td>{order.groomName || "-"}</td>
                <td>{order.brideName || "-"}</td>
                <td>
                  {affiliations[order.affiliation_id] ||
                    order.affiliation_id ||
                    "-"}
                </td>
                <td>{getCollectionMethod(order.collectionMethod) || "-"}</td>
                <td>
                  <select
                    name={`order_${order.id}`}
                    value={order.status}
                    onChange={(event) =>
                      handleOrderStatusChange(event, order.id)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className={styles.orderStatus}
                  >
                    <option value="Order Completed">주문완료</option>
                    <option value="Packaging Completed">포장완료</option>
                    <option value="Repair Received">수선접수</option>
                    <option value="Repair Completed">수선완료</option>
                    <option value="In delivery">배송중</option>
                    <option value="Delivery completed">배송완료</option>
                    <option value="Receipt completed">수령완료</option>
                    <option value="Accommodation">숙소</option>
                    <option value="Counsel">상담</option>
                  </select>
                </td>
                <td>
                  {new Date(order.created_at).toLocaleDateString() || "-"}
                </td>
                <td>{order.totalPrice || "-"}</td>
                <td>{order.advancePayment + order.balancePayment || "-"}</td>
                <td>{order.payments?.[0]?.payer || "-"}</td>
                <td>{order.address || "-"}</td>
                <td>{order.event_name || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    ),
    [
      filters,
      ordersLoading,
      authors,
      affiliations,
      handleSort,
      handleOrderStatusChange,
      handleRowClick,
    ]
  );

  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>주문서 목록</h2>
        <section className={styles.section}>
          <Tab defaultActiveTab="tab1" onTabChange={handleTabChange}>
            <Tab.TabPane name="tab1" tab="주문서 목록">
              <Filter
                filters={filters}
                setFilters={setFilters}
                isAdminPage={true}
              />
              <div className={styles.actionButtonsWrap}>
                <Button
                  label="Excel 저장"
                  className={styles.excelButton}
                  onClick={handleExcelDownload}
                  disabled={downloadOrdersMutation.isLoading}
                />
                <Button
                  label="주문서 작성"
                  className={styles.newOrderButton}
                  onClick={() => setIsEventSelectionModalOpen(true)}
                />
              </div>
              {renderTable(orders)}
              <Pagination
                className={styles.pagination}
                totalItems={total}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </Tab.TabPane>
            <Tab.TabPane name="tab2" tab="임시저장 목록">
              <Filter
                filters={filters}
                setFilters={setFilters}
                isAdminPage={true}
              />
              <div className={styles.actionButtonsWrap}>
                <Button
                  label="Excel 저장"
                  className={styles.excelButton}
                  onClick={handleExcelDownload}
                  disabled={downloadOrdersMutation.isLoading}
                />
                <Button
                  label="주문서 작성"
                  className={styles.newOrderButton}
                  onClick={() => setIsEventSelectionModalOpen(true)}
                />
              </div>
              {renderTable(orders)}
              <Pagination
                className={styles.pagination}
                totalItems={total}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </Tab.TabPane>
          </Tab>
        </section>
      </main>
      <EventSelectionModal
        isOpen={isEventSelectionModalOpen}
        onClose={() => setIsEventSelectionModalOpen(false)}
        onSelectEvent={handleEventSelection}
        events={events || []}
        navigate={navigate}
      />
    </div>
  );
};
