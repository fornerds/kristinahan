import { Button, Input, Link } from "../../../../components";
import { Modal, TabNavigation } from "../../../../modules";
import { ReactComponent as DeleteIcon } from '../../../../asset/icon/delete.svg'
import styles from "./Product.module.css";
import { useState } from "react";

export const Product = () => {
    const [categoryName, setCategoryName] = useState('');
    const [products, setProducts] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const addProduct = () => {
        setProducts([...products, { name: '', sizes: [], price: '' }]);
    };

    const removeProduct = (index) => {
        setProducts(products.filter((_, i) => i !== index));
    };

    const updateProduct = (index, field, value) => {
        const updatedProducts = [...products];
        updatedProducts[index] = { ...updatedProducts[index], [field]: value };
        setProducts(updatedProducts);
    };

    const addSize = (productIndex) => {
        const updatedProducts = [...products];
        updatedProducts[productIndex].sizes.push('');
        setProducts(updatedProducts);
    };

    const updateSize = (productIndex, sizeIndex, value) => {
        const updatedProducts = [...products];
        updatedProducts[productIndex].sizes[sizeIndex] = value;
        setProducts(updatedProducts);
    };

    const removeSize = (productIndex, sizeIndex) => {
        const updatedProducts = [...products];
        updatedProducts[productIndex].sizes.splice(sizeIndex, 1);
        setProducts(updatedProducts);
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
                <h2 className={styles.adminTitle}>상품 카테고리 관리</h2>
                <div className={styles.sectionWrap}>
                    <section className={styles.section}>
                        <label htmlFor="productCategoryName">카테고리명</label>
                        <Input 
                            id="productCategoryName"
                            type="text" 
                            className={styles.input}
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                        />
                    </section>
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>상품목록</h3>
                        {products.length > 0 ? (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>상품명</th>
                                        <th>사이즈</th>
                                        <th>가격</th>
                                        <th>삭제</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    className={styles.input}
                                                    value={product.name}
                                                    onChange={(e) => updateProduct(index, 'name', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <div className={styles.sizeContainer}>
                                                    {product.sizes.map((size, sizeIndex) => (
                                                        <div key={sizeIndex} className={styles.sizeItem}>
                                                            <Input
                                                                type="text"
                                                                className={styles.sizeInput}
                                                                value={size}
                                                                onChange={(e) => updateSize(index, sizeIndex, e.target.value)}
                                                            />
                                                            <Button onClick={() => removeSize(index, sizeIndex)} className={styles.removeSizeButton} variant="danger">
                                                                <DeleteIcon />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button onClick={() => addSize(index)} className={styles.addSizeButton}>+</Button>
                                                </div>
                                            </td>
                                            <td>
                                                <p className={styles.priceInputWrap}>
                                                <Input
                                                    type="number" 
                                                    className={styles.priceInput}
                                                    value={product.price}
                                                    onChange={(e) => updateProduct(index, 'price', e.target.value)}
                                                />
                                                원
                                                </p>
                                            </td>
                                            <td>
                                                <Button onClick={() => removeProduct(index)} className={styles.deleteButton} variant="danger">
                                                    <DeleteIcon />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className={styles.noCategories}>등록된 상품이 없습니다.</p>
                        )}
                        <Button onClick={addProduct} className={styles.addButton} label="+ 상품 추가하기" />
                    </section>
                </div>
                <div className={styles.spacebetween}>
                    <Button onClick={handleDelete} label="삭제" className={styles.deleteProductButton} variant="danger" />
                    <div className={styles.buttonGroup}>
                        <Link className={styles.cancelLink} to="/admin/product" >취소</Link>
                        <Button onClick={() => console.log('Form saved', { categoryName, products })} className={styles.saveButton} label="저장" />
                    </div>
                </div>
            </main>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="상품 카테고리 삭제"
                message="정말로 해당 상품 카테고리를 삭제하시겠습니까?"
                confirmLabel="삭제"
                onConfirm={confirmDelete}
                cancelLabel="취소"
                onCancel={() => setIsDeleteModalOpen(false)}
            />
        </div>
    );
};