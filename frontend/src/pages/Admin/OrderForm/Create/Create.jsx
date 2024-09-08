import { Button, Input, Link } from "../../../../components";
import { Modal, TabNavigation } from "../../../../modules";
import { ReactComponent as DeleteIcon } from '../../../../asset/icon/delete.svg'
import styles from "./Create.module.css";
import { useState } from "react";

export const Create = () => {
    const [formName, setFormName] = useState('');
    const [categories, setCategories] = useState([
        '턱시도 자켓', '남성 팬츠', '남성 셔츠', '드레스', '남자 반지', '여성 반지', '목걸이', '귀걸이'
    ]);
    const [selectedCategories, setSelectedCategories] = useState(['턱시도 자켓']); // 초기값 설정
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const addCategory = () => {
        setSelectedCategories([...selectedCategories, categories[0]]); // 첫 번째 카테고리를 기본값으로 추가
    };

    const removeCategory = (index) => {
        setSelectedCategories(selectedCategories.filter((_, i) => i !== index));
    };

    const handleCategoryChange = (index, value) => {
        const updatedCategories = [...selectedCategories];
        updatedCategories[index] = value;
        setSelectedCategories(updatedCategories);
    };

    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        // 여기서 실제 삭제 로직을 구현합니다.
        console.log('Form deleted');
        setIsDeleteModalOpen(false);
    };

    return (
        <div className={styles.adminLayout}>
            <TabNavigation />
            <main className={styles.adminMainWrap}>
                <h2 className={styles.adminTitle}>주문서 양식 관리</h2>
                <div className={styles.sectionWrap}>
                    <section className={styles.section}>
                        <label htmlFor="orderFormName">주문서 양식명</label>
                        <Input 
                            name="orderFormName" 
                            type="text" 
                            className={styles.input}
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                        />
                    </section>
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>등록된 카테고리</h3>
                        {selectedCategories.length > 0 ? (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>이름</th>
                                        <th>삭제</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedCategories.map((category, index) => (
                                        <tr key={index}>
                                            <td>
                                                <select
                                                    value={category}
                                                    onChange={(e) => handleCategoryChange(index, e.target.value)}
                                                    className={styles.select}
                                                >
                                                    {categories.map((cat) => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <Button onClick={() => removeCategory(index)} className={styles.deleteButton} variant="danger">
                                                    <DeleteIcon />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className={styles.noCategories}>등록된 카테고리가 없습니다.</p>
                        )}
                        <Button onClick={addCategory} label="+ 카테고리 추가하기" className={styles.addButton} />
                    </section>
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>수선정보</h3>
                        <div className={styles.sectionGroupWrap}>
                            {['자켓 소매', '자켓 기장', '자켓 폼', '셔츠 목', '셔츠 소매', '바지 둘레', '바지 길이', '드레스 뒷품', '드레스 기장'].map((item) => (
                                <div key={item} className={styles.sectionVerticalGroup}>
                                    <span className={styles.sectionLabel}>{item}</span>
                                    <select defaultValue="inch" className={styles.select}>
                                        <option value="inch">inch</option>
                                        <option value="cm">cm</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
                <div className={styles.buttonGroup}>
                    <Link to="/admin/orderform" className={styles.cancelLink}>취소</Link>
                    <Button onClick={() => console.log('Form saved')} label="저장" className={styles.saveButton} />
                </div>
            </main>
        </div>
    );
};