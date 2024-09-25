import React from "react";
import { Button } from "../../components";
import { ReactComponent as SearchIcon } from "../../asset/icon/search.svg";
import styles from "./Filter.module.css";

export const Filter = ({ filters, setFilters }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    // 날짜가 비어있으면 null로 설정
    setFilters((prev) => ({ ...prev, [name]: value ? value : null }));
  };

  const handleSearch = () => {
    // 검색 로직을 여기에 구현합니다.
    console.log("Current filters:", filters);
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
        <Button className={styles.searchButton} onClick={handleSearch}>
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
          <option value="Order_Completed">주문완료</option>
          <option value="Packaging_Completed">포장완료</option>
          <option value="Repair_Received">수선접수</option>
          <option value="Repair_Completed">수선완료</option>
          <option value="In_delivery">배송중</option>
          <option value="Delivery_completed">배송완료</option>
          <option value="Receipt_completed">수령완료</option>
          <option value="Accommodation">숙소</option>
        </select>
      </div>

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
    </div>
  );
};
