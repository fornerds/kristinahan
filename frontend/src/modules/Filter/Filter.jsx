import { Button } from "../../components"
import { ReactComponent as SearchIcon } from '../../asset/icon/search.svg'
import styles from "./Filter.module.css"

export const Filter = () => {
    return (
        <div className={styles.filter}>
            <div className={styles.searchWrap}>
                <label htmlFor="search">검색</label>
                <input type="search" className={styles.searchInput} placeholder="고객명, 국가, 소속 등" name="search"/>
                <Button className={styles.searchButton}>
                    <SearchIcon strokeOpacity="1" />
                </Button>
            </div>

            <div className={styles.orderStatusWrap}>
                <label htmlFor="orderStatus">주문상태</label>
                <select name="orderStatus" id={styles.orderStatus} >
                    <option value="">전체</option>
                    <option value="주문완료">주문완료</option>
                    <option value="포장완료">포장완료</option>
                    <option value="수선접수">수선접수</option>
                    <option value="수선완료">수선완료</option>
                    <option value="배송중">배송중</option>
                    <option value="배송완료">배송완료</option>
                    <option value="수령완료">수령완료</option>
                    <option value="숙소">숙소</option>
                </select>
            </div>

            <div className={styles.dateRangeWrap}>
                <label htmlFor="startDate">작성일자</label>
                <input type="date" name="startDate" id="startDate" className={styles.dateInput} />
                ~
                <input type="date" name="endDate" id="endDate" className={styles.dateInput} />
            </div>
        </div>
    )
}