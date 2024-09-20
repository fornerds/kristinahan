import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "../../components"
import styles from "./OrderForm.module.css"
import { PaymentTable } from './PaymentTable';

export const OrderForm = ({ event_id, isEdit, onSave, onComplete }) => {
    const [customerName, setCustomerName] = useState('');
    const [payerName, setPayerName] = useState('');
    const [isPayerSameAsCustomer, setIsPayerSameAsCustomer] = useState(false);
    const [prepaymentTotal, setPrepaymentTotal] = useState(0);
    const [balanceTotal, setBalanceTotal] = useState(0);
    const [productPrice, setProductPrice] = useState(0);

    useEffect(() => {
        if (isPayerSameAsCustomer) {
        setPayerName(customerName);
        }
    }, [isPayerSameAsCustomer, customerName]);

    const handleCustomerNameChange = useCallback((e) => {
        setCustomerName(e.target.value);
        if (isPayerSameAsCustomer) {
        setPayerName(e.target.value);
        }
    }, [isPayerSameAsCustomer]);

    const handlePayerCheckboxChange = useCallback((e) => {
        setIsPayerSameAsCustomer(e.target.checked);
        if (e.target.checked) {
        setPayerName(customerName);
        }
    }, [customerName]);

    const handleProductChange = useCallback((id, field, value) => {
        setProducts(prevProducts => 
            prevProducts.map(product => 
                product.id === id ? { ...product, [field]: value } : product
            )
        );
    }, []);

    const [products, setProducts] = useState([
        {id:1, category: "턱시도 자켓", types: {1:"턱시도"}, sizes: {1:"S", 2:"M", 3:"L"}, count: "1"},
        {id:2, category: "남성 팬츠", types: {1:"팬츠"}, sizes: {1:"S", 2:"M", 3:"L"}, count: "1"},
        {id:3, category: "남성 셔츠", types: {1:"셔츠"}, sizes: {1:"S", 2:"M", 3:"L"}, count: "1"},
        {id:4, category: "드레스", types: {1:"드레스"}, sizes: {1:"S", 2:"M", 3:"L"}, count: "1"},
        {id:5, category: "남자 반지", types: {1:"남성반지"}, sizes: {1:"12", 2:"13", 3:"14", 4:"15", 5:"16"}, count: "1"},
        {id:6, category: "여성 반지", types: {1:"여성반지"}, sizes: {1:"8", 2:"9", 3:"10", 4:"11", 5:"12"}, count: "1"},
        {id:7, category: "목걸이", types: {1:"목걸이"}, sizes: {1:"S", 2:"M", 3:"L"}, count: "1"},
        {id:8, category: "귀걸이", types: {1:"귀걸이"}, sizes: {1:"S", 2:"M", 3:"L"}, count: "1"},
    ])

    return (
        <>
            <section className={styles.sectionWrap}>
                <h3 className={styles.sectionTitle}>주문정보</h3>

                <div className={styles.sectionValueWrap}>
                    <h4 className={styles.sectionLabel}>주문번호</h4>
                    <p className={styles.sectionValue}>202408281234</p>
                </div>

                <div className={styles.sectionGroupWrap}>

                    {isEdit ? (<>
                        <div className={styles.sectionGroup}>
                            <h4 className={styles.sectionLabel}>작성자</h4>
                            <div className={styles.sectionGroup}>
                                <h4 className={styles.sectionLabel}>작성일자</h4>
                                <p className={styles.sectionValue}>{new Date().toLocaleDateString("ko-KR")}</p>
                            </div>
                        </div>
                        <div className={styles.sectionGroup}>
                            <h4 className={styles.sectionLabel}>수정자</h4>
                            <select name="writer" id={styles.writer} >
                                <option value="">관리자</option>
                                <option value="이범찬">이범찬</option>
                                <option value="김유정">김유정</option>
                                <option value="사키코">사키코</option>
                                <option value="윤정은">윤정은</option>
                                <option value="김도영">김도영</option>
                                <option value="서다희">서다희</option>
                                <option value="김화언">김화언</option>
                            </select>
                        </div>
                        <div className={styles.sectionGroup}>
                            <h4 className={styles.sectionLabel}>수정일자</h4>
                            <p className={styles.sectionValue}>{new Date().toLocaleDateString("ko-KR")}</p>
                        </div>
                        </>
                    ) :
                    (
                    <>
                        <div className={styles.sectionGroup}>
                            <h4 className={styles.sectionLabel}>작성자</h4>
                            <select name="writer" id={styles.writer} >
                                <option value="">관리자</option>
                                <option value="이범찬">이범찬</option>
                                <option value="김유정">김유정</option>
                                <option value="사키코">사키코</option>
                                <option value="윤정은">윤정은</option>
                                <option value="김도영">김도영</option>
                                <option value="서다희">서다희</option>
                                <option value="김화언">김화언</option>
                            </select>
                        </div>
                        <div className={styles.sectionGroup}>
                            <h4 className={styles.sectionLabel}>작정일자</h4>
                            <p className={styles.sectionValue}>{new Date().toLocaleDateString("ko-KR")}</p>
                        </div>
                    </>
                    )
                    }

                </div>

                <div className={styles.sectionGroupWrap}>
                    <h4 className={styles.sectionLabel}>주문상태</h4>
                    
                    <form className={styles.sectionGroup}>
                        <input type="radio" name="orderSatus" id="주문완료" />
                        <label htmlFor="주문완료">주문완료</label>
                        <input type="radio" name="orderSatus" id="포장완료" />
                        <label htmlFor="포장완료">포장완료</label>
                        <input type="radio" name="orderSatus" id="수선접수" />
                        <label htmlFor="수선접수">수선접수</label>
                        <input type="radio" name="orderSatus" id="수선완료" />
                        <label htmlFor="수선완료">수선완료</label>
                        <input type="radio" name="orderSatus" id="배송중" />
                        <label htmlFor="배송중">배송중</label>
                        <input type="radio" name="orderSatus" id="배송완료" />
                        <label htmlFor="배송완료">배송완료</label>
                        <input type="radio" name="orderSatus" id="수령완료" />
                        <label htmlFor="수령완료">수령완료</label>
                        <input type="radio" name="orderSatus" id="숙소" />
                        <label htmlFor="숙소">숙소</label>
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
                        <Input type="tel" className={styles.textInput}></Input>
                    </div>
                    <div className={styles.sectionVerticalGroup}>
                        <h4 className={styles.sectionLabel}>소속</h4>
                        <select name="relation" id={styles.relation} >
                            <option value="한국-한국">한국-한국</option>
                            <option value="한국-일본">한국-일본</option>
                            <option value="한국-국제">한국-국제</option>
                            <option value="일본-한국">일본-한국</option>
                            <option value="일본-일본">일본-일본</option>
                            <option value="일본-국제">일본-국제</option>
                            <option value="국제-한국">국제-한국</option>
                            <option value="국제-일본">국제-일본</option>
                            <option value="국제-국제">국제-국제</option>
                        </select>
                    </div>
                </div>

                <div className={styles.sectionGroupWrap}>
                    <div className={styles.sectionVerticalGroup}>
                        <h4 className={styles.sectionLabel}>배송지 입력</h4>
                        <Input type="text" className={styles.addressInput}></Input>
                    </div>

                    <div className={styles.sectionVerticalGroup}>
                        <h4 className={styles.sectionLabel}>수령방법</h4>
                        <select name="takeout" id={styles.takeout} >
                            <option value="배송">배송</option>
                            <option value="현장수령(기혼 불가)">현장수령 (기혼 불가)</option>
                            <option value="매장수령">매장수령</option>
                        </select>
                    </div>
                </div>

                <div className={styles.sectionValueWrap}>
                    <div className={styles.sectionVerticalGroup}>                                
                        <h4 className={styles.sectionLabel}>기타사항</h4>
                        <textarea name="optionalMessage" id="optionalMessage" className={styles.optionalMessage}></textarea>
                    </div>
                </div>
            </section>

            <section className={styles.sectionWrap}>
                <h3 className={styles.sectionTitle}>상품정보</h3>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th scope="col">카테고리</th>
                            <th scope="col">상품종류</th>
                            <th scope="col">사이즈</th>
                            <th scope="col">개수</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.category}</td>
                            <td>
                                <select 
                                    name="types" 
                                    id={styles.types}
                                    value={Object.values(product.types)[0]}
                                    onChange={(e) => handleProductChange(product.id, 'types', {1: e.target.value})}
                                >
                                    {Object.entries(product.types).map(([key, type]) => (
                                        <option key={key} value={type}>{type}</option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <select 
                                    name="sizes" 
                                    id={styles.sizes}
                                    value={Object.values(product.sizes)[0]}
                                    onChange={(e) => handleProductChange(product.id, 'sizes', {1: e.target.value})}
                                >
                                    {Object.entries(product.sizes).map(([key, size]) => (
                                        <option key={key} value={size}>{size}</option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <Input 
                                    className={styles.numberInput} 
                                    type="text" 
                                    value={product.count}
                                    onChange={(e) => handleProductChange(product.id, 'count', e.target.value)}
                                />
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className={styles.sectionWrap}>
                <h3 className={styles.sectionTitle}>결제정보</h3>

                <PaymentTable title="선급금" onTotalChange={setPrepaymentTotal} />
                <PaymentTable title="잔금" onTotalChange={setBalanceTotal} />

                <div className={styles.sectionValueWrap}>
                <div className={styles.sectionVerticalGroup}>
                    <h4 className={styles.sectionLabel}>결제자</h4>
                    <div className={styles.sectionGroup}>
                    <input 
                        type="text" 
                        className={styles.textInput} 
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        disabled={isPayerSameAsCustomer}
                    />
                    <div className={styles.sectionGroup}>
                        <input 
                        type="checkbox" 
                        name="takeCustomerName" 
                        checked={isPayerSameAsCustomer}
                        onChange={handlePayerCheckboxChange}
                        />
                        <label htmlFor="takeCustomerName" className={styles.checkboxLabel}>주문자와 동일</label>
                    </div>
                    </div>
                </div>
                </div>

                <div className={styles.sectionValueWrap}>
                    <div className={styles.sectionVerticalGroup}>                                
                        <h4 className={styles.sectionLabel}>기타사항</h4>
                        <textarea name="currencyOptionalMessage" id="currencyOptionalMessage" className={styles.optionalMessage}></textarea>
                    </div>
                </div>
                
                <div className={styles.calculator}>   
                    <div className={styles.spacebetween}>
                        <h4 className={styles.sectionLabel}>상품 가격</h4>
                        <p>{productPrice.toLocaleString()} 원</p>
                    </div>
                    <div className={styles.spacebetween}>
                        <h4 className={styles.sectionLabel}>선급금 총액</h4>
                        <p className={styles.paid}>{prepaymentTotal.toLocaleString()} 원</p>
                    </div>
                    <div className={styles.spacebetween}>
                        <h4 className={styles.sectionLabel}>잔금 총액</h4>
                        <p className={styles.paid}>{balanceTotal.toLocaleString()} 원</p>
                    </div>
                    <hr className={styles.hr} />
                    <div className={styles.spacebetween}>
                        <h4 className={styles.sectionLabel}>총 잔액</h4>
                        <p className={styles.rest}>{(productPrice - prepaymentTotal - balanceTotal).toLocaleString()} 원</p>
                    </div>
                </div>
            </section>

            <section className={styles.sectionWrap}>
                <h3 className={styles.sectionTitle}>수선정보</h3>

                <div className={styles.sectionGroupWrap}>
                    <div className={styles.sectionVerticalGroup}>
                        <h4 className={styles.sectionLabel}>자켓 소매</h4>
                        <div className={styles.sectionGroup}>
                            <input type="number" className={styles.numberInput}/>
                            cm
                        </div>
                    </div>
                    <div className={styles.sectionVerticalGroup}>
                        <h4 className={styles.sectionLabel}>자켓 기장</h4>
                        <div className={styles.sectionGroup}>
                            <input type="number" className={styles.numberInput}/>
                            cm
                        </div>
                    </div>
                    <div className={styles.sectionVerticalGroup}>
                        <h4 className={styles.sectionLabel}>자켓 폼</h4>
                        <div className={styles.sectionGroup}>
                            <input type="number" className={styles.numberInput}/>
                            cm
                        </div>
                    </div>
                </div>

                <div className={styles.sectionGroupWrap}>
                    <div className={styles.sectionVerticalGroup}>
                        <h4 className={styles.sectionLabel}>셔츠 목</h4>
                        <div className={styles.sectionGroup}>
                            <input type="number" className={styles.numberInput}/>
                            cm
                        </div>
                    </div>
                    <div className={styles.sectionVerticalGroup}>
                        <h4 className={styles.sectionLabel}>셔츠 소매</h4>
                        <div className={styles.sectionGroup}>
                            <input type="number" className={styles.numberInput}/>
                            cm
                        </div>
                    </div>
                </div>

                <div className={styles.sectionGroupWrap}>
                    <div className={styles.sectionVerticalGroup}>
                        <h4 className={styles.sectionLabel}>바지 둘레</h4>
                        <div className={styles.sectionGroup}>
                            <input type="number" className={styles.numberInput}/>
                            cm
                        </div>
                    </div>
                    <div className={styles.sectionVerticalGroup}>
                        <h4 className={styles.sectionLabel}>바지 길이</h4>
                        <div className={styles.sectionGroup}>
                            <input type="number" className={styles.numberInput}/>
                            cm
                        </div>
                    </div>
                </div>

                <div className={styles.sectionGroupWrap}>
                    <div className={styles.sectionVerticalGroup}>
                        <h4 className={styles.sectionLabel}>드레스 뒷품</h4>
                        <div className={styles.sectionGroup}>
                            <input type="number" className={styles.numberInput}/>
                            cm
                        </div>
                    </div>
                    <div className={styles.sectionVerticalGroup}>
                        <h4 className={styles.sectionLabel}>드레스 기장</h4>
                        <div className={styles.sectionGroup}>
                            <input type="number" className={styles.numberInput}/>
                            cm
                        </div>
                    </div>
                </div>

                <div className={styles.sectionValueWrap}>
                    <div className={styles.sectionVerticalGroup}>                                
                        <h4 className={styles.sectionLabel}>비고</h4>
                        <textarea name="dressOptionalMessage" id="dressOptionalMessage" className={styles.optionalMessage}></textarea>
                    </div>
                </div>
            </section>
        </>
    )
}

export default OrderForm;