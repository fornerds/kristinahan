import React, { useEffect, useState } from 'react'
import { Pagination } from "../../modules/Pagination/Pagination"
import styles from "./Event.module.css"
import { Link } from '../../components'
import axiosInstance from '../../api/axios'

export const Event = () => {
  const [currentPage, setCurrentPage] = useState(1)
     const [eventList, setEventList] = useState([]);
     const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState(null);
     const itemsPerPage = 5

     useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const res = await axiosInstance.get("/event");
          console.log('Response data:', res.data);
          if (res.status === 200) {
            setEventList(Array.isArray(res.data) ? res.data : []);
          }
        } catch (error) {
          console.error("Error fetching events:", error);
          if (error.response) {
            console.error("Error response:", error.response);
          }
          setError("이벤트 데이터를 불러오는 데 실패했습니다.");
        } finally {
          setIsLoading(false);
        }
      };

       fetchData();
     }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = eventList.slice(indexOfFirstItem, indexOfLastItem)

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
                <td colSpan="5" className={styles.loadingMessageWrap}>행사 데이터를 불러오는 중입니다...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className={styles.errorMessageWrap}>{error}</td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{event.start_date}</td>
                  <td>{event.end_date}</td>
                  <td>
                    <Link to={event.new_order} className={styles.link}>주문서 작성</Link>
                  </td>
                  <td>
                    <Link to={event.order_list} className={styles.link}>주문서 목록 이동</Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={styles.noDataMessageWrap}>표시할 이벤트가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
        {!isLoading && !error && eventList.length > 0 && (
          <Pagination
            className={styles.pagination}
            currentPage={currentPage}
            totalItems={eventList.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </section>
    </div>
  )
}