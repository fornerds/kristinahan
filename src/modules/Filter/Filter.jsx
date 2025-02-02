import React from "react";
import { Button } from "../../components";
import { ReactComponent as SearchIcon } from "../../asset/icon/search.svg";
import { ReactComponent as RefreshIcon } from "../../asset/icon/refresh.svg";
import styles from "./Filter.module.css";
import { useAllEvents } from "../../api/hooks";

export const Filter = ({
  filters,
  setFilters,
  isAdminPage = false,
  currentEventName = "",
}) => {
  const { data: events } = useAllEvents();

  const initialFilters = {
    search: "",
    status: "",
    event_name: currentEventName,
    order_date_from: null,
    order_date_to: null,
    sort: "order_date_desc",
    is_temp: false,
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value || null }));
  };

  const handleReset = () => {
    setFilters((prev) => ({
      ...initialFilters,
      is_temp: prev.is_temp,
      event_name: isAdminPage ? prev.event_name : currentEventName,
    }));
  };

  return (
    <div className={styles.filter}>
      <div className={styles.searchWrap}>
        <label htmlFor="search">검색</label>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="고객명, 작성자, 결제자, 주소, 소속"
          name="search"
          value={filters.search}
          onChange={handleInputChange}
        />
        <Button className={styles.searchButton}>
          <SearchIcon strokeOpacity="1" />
        </Button>
      </div>

      <div className={styles.orderStatusWrap}>
        <label htmlFor="status">주문상태</label>
        <select
          name="status"
          id={styles.orderStatus}
          value={filters.status}
          onChange={handleInputChange}
        >
          <option value="">전체</option>
          <option value="Counsel">상담</option>
          <option value="Order Completed">주문완료</option>
          <option value="Packaging Completed">포장완료</option>
          <option value="Repair Received">수선접수</option>
          <option value="Repair Completed">수선완료</option>
          <option value="In delivery">배송중</option>
          <option value="Delivery completed">배송완료</option>
          <option value="Receipt completed">수령완료</option>
          <option value="Accommodation">숙소</option>
        </select>
      </div>

      {isAdminPage && (
        <div className={styles.eventWrap}>
          <label htmlFor="event_name">행사</label>
          <select
            name="event_name"
            id={styles.eventName}
            value={filters.event_name}
            onChange={handleInputChange}
          >
            <option value="">전체</option>
            {events?.map((event) => (
              <option key={event.id} value={event.name}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.dateRangeWrap}>
        <label htmlFor="order_date_from">작성일자</label>
        <input
          type="date"
          name="order_date_from"
          id="order_date_from"
          className={styles.dateInput}
          value={filters.order_date_from || ""}
          onChange={handleDateChange}
        />
        ~
        <input
          type="date"
          name="order_date_to"
          id="order_date_to"
          className={styles.dateInput}
          value={filters.order_date_to || ""}
          onChange={handleDateChange}
        />
      </div>

      <Button className={styles.resetButton} onClick={handleReset}>
        <RefreshIcon />
      </Button>
    </div>
  );
};
