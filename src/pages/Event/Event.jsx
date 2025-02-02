import React, { useState } from "react";
import { Pagination } from "../../modules/Pagination/Pagination";
import styles from "./Event.module.css";
import { Link } from "../../components";
import { useCurrentEvents } from "../../api/hooks";

export const Event = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: events, isLoading, error } = useCurrentEvents();

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const processedEvents = events || [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedEvents.slice(indexOfFirstItem, indexOfLastItem);

  // console.log("Current Items:", currentItems);

  return (
    <div className={styles.eventTableBackground}>
      <section className={styles.tableWrap}>
        <h2 className={styles.tableTitle}>현재 진행중인 대회 목록</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">제목</th>
              <th scope="col">시작기간</th>
              <th scope="col">종료기간</th>
              <th scope="col">주문서 작성</th>
              <th scope="col">주문서 목록</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className={styles.loadingMessageWrap}>
                  행사 데이터를 불러오는 중입니다...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className={styles.errorMessageWrap}>
                  이벤트 데이터를 불러오는 데 실패했습니다.
                  {error.message && <p>오류 메시지: {error.message}</p>}
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.noDataMessageWrap}>
                  현재 진행 중인 이벤트가 없습니다.
                </td>
              </tr>
            ) : (
              currentItems.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>{new Date(event.start_date).toLocaleDateString()}</td>
                  <td>{new Date(event.end_date).toLocaleDateString()}</td>
                  <td>
                    <Link
                      to={`/event/${event.id}/create`}
                      className={styles.link}
                    >
                      주문서 작성
                    </Link>
                  </td>
                  <td>
                    <Link to={`/event/${event.id}`} className={styles.link}>
                      주문서 목록 이동
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!isLoading && !error && events.length > itemsPerPage && (
          <Pagination
            className={styles.pagination}
            currentPage={currentPage}
            totalItems={events.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </section>
    </div>
  );
};
