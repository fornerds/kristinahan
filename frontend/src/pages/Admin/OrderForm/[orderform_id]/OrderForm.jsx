import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Input, Link } from "../../../../components";
import { Modal, TabNavigation } from "../../../../modules";
import { ReactComponent as DeleteIcon } from "../../../../asset/icon/delete.svg";
import styles from "./OrderForm.module.css";
import {
  useFormDetails,
  useUpdateForm,
  useCategories,
  useDeleteForm,
} from "../../../../api/hooks";

export const OrderForm = () => {
  const { orderform_id } = useParams();
  const navigate = useNavigate();
  const { data: form, isLoading, isError } = useFormDetails(orderform_id);
  const { data: allCategories, isLoading: isCategoriesLoading } =
    useCategories();
  const updateFormMutation = useUpdateForm();
  const deleteFormMutation = useDeleteForm();

  const [formName, setFormName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [repairs, setRepairs] = useState([]);
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    if (form) {
      setFormName(form.name);
      // 카테고리 데이터 구조 정규화
      const normalizedCategories = (form.categories || []).map((category) => ({
        id: Number(category.id),
        name: category.name,
      }));
      setSelectedCategories(normalizedCategories);
      setRepairs(form.repairs || []);
    }
  }, [form]);

  const addRepair = () => {
    setRepairs([
      ...repairs,
      {
        information: "",
        unit: "cm",
        standards: "",
        isAlterable: true,
      },
    ]);
  };

  const removeRepair = (index) => {
    setRepairs(repairs.filter((_, i) => i !== index));
  };

  const updateRepair = (index, field, value) => {
    const updatedRepairs = [...repairs];
    updatedRepairs[index] = {
      ...updatedRepairs[index],
      [field]: value,
    };
    setRepairs(updatedRepairs);
  };

  const addCategory = () => {
    if (!allCategories?.length) return;

    const selectedIds = new Set(
      selectedCategories.map((cat) => Number(cat.id))
    );
    const availableCategories = allCategories.filter(
      (cat) => !selectedIds.has(Number(cat.id))
    );

    if (availableCategories.length > 0) {
      const categoryToAdd = availableCategories[0];
      setSelectedCategories([
        ...selectedCategories,
        {
          id: Number(categoryToAdd.id),
          name: categoryToAdd.name,
        },
      ]);
    } else {
      setModalInfo({
        isOpen: true,
        title: "알림",
        message: "추가할 수 있는 카테고리가 없습니다.",
      });
    }
  };

  const removeCategory = (index) => {
    setSelectedCategories(selectedCategories.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (index, newCategoryId) => {
    const newCategory = allCategories.find(
      (cat) => cat.id === Number(newCategoryId)
    );
    if (newCategory) {
      const updatedCategories = [...selectedCategories];
      updatedCategories[index] = {
        id: Number(newCategory.id),
        name: newCategory.name,
      };
      setSelectedCategories(updatedCategories);
    }
  };

  const handleSave = async () => {
    try {
      const cleanedRepairs = repairs.map(({ id, indexNumber, ...repair }) => ({
        ...repair,
        isAlterable: Boolean(repair.isAlterable),
        standards: repair.standards || null,
      }));

      // 단순한 숫자 배열로 변환
      const categoryIds = selectedCategories.map((category) =>
        typeof category.id === "string"
          ? parseInt(category.id, 10)
          : category.id
      );

      const formData = {
        name: formName,
        repairs: cleanedRepairs,
        categories: categoryIds,
      };

      await updateFormMutation.mutateAsync({
        formId: orderform_id,
        formData: formData,
      });

      navigate("/admin/orderform");
    } catch (error) {
      console.error("Update form error:", error);
      setModalInfo({
        isOpen: true,
        title: "오류",
        message:
          "주문서 양식 수정에 실패했습니다: " +
          (error.response?.data?.detail || error.message),
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFormMutation.mutateAsync(orderform_id);
      // 성공 시 목록 페이지로 이동
      navigate("/admin/orderform");
    } catch (error) {
      setModalInfo({
        isOpen: true,
        title: "오류",
        message:
          "주문서 양식 삭제에 실패했습니다: " +
          (error.response?.data?.detail || error.message),
      });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const closeModal = () => {
    setModalInfo({ isOpen: false, title: "", message: "" });
    if (modalInfo.title === "성공") {
      navigate("/admin/orderform");
    }
  };

  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>주문서 양식 관리</h2>
        {isLoading || isCategoriesLoading ? (
          <div>로딩 중...</div>
        ) : isError ? (
          <div>에러가 발생했습니다.</div>
        ) : (
          <>
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
                <h3 className={styles.sectionTitle}>수선 정보</h3>
                {repairs.map((repair, index) => (
                  <div key={index} className={styles.repairItem}>
                    <div className={styles.repairContent}>
                      <div className={styles.repairField}>
                        <Input
                          type="text"
                          value={repair.information}
                          onChange={(e) =>
                            updateRepair(index, "information", e.target.value)
                          }
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.repairRow}>
                        <div className={styles.repairField}>
                          <label>단위</label>
                          <select
                            value={repair.unit}
                            onChange={(e) =>
                              updateRepair(index, "unit", e.target.value)
                            }
                            className={styles.select}
                          >
                            <option value="cm">cm</option>
                            <option value="inch">inch</option>
                          </select>
                        </div>

                        <div className={styles.repairField}>
                          <label>기준값</label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={repair.standards}
                            onChange={(e) =>
                              updateRepair(index, "standards", e.target.value)
                            }
                            className={styles.input}
                          />
                        </div>
                      </div>

                      <div className={styles.repairField}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={repair.isAlterable}
                            onChange={(e) =>
                              updateRepair(
                                index,
                                "isAlterable",
                                e.target.checked
                              )
                            }
                            className={styles.checkbox}
                          />
                          수선 가능 여부
                        </label>
                      </div>
                    </div>

                    <Button
                      onClick={() => removeRepair(index)}
                      className={styles.deleteButton}
                      variant="danger"
                    >
                      <DeleteIcon />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={addRepair}
                  label="+ 수선 정보 추가"
                  className={styles.addButton}
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
                        <tr key={category.id}>
                          <td>
                            <select
                              value={category.id}
                              onChange={(e) =>
                                handleCategoryChange(index, e.target.value)
                              }
                              className={styles.select}
                            >
                              {allCategories?.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <Button
                              onClick={() => removeCategory(index)}
                              className={styles.deleteButton}
                              variant="danger"
                            >
                              <DeleteIcon />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className={styles.noCategories}>
                    등록된 카테고리가 없습니다.
                  </p>
                )}
                <Button
                  onClick={addCategory}
                  label="+ 카테고리 추가하기"
                  className={styles.addButton}
                />
              </section>
            </div>
            <div className={styles.spacebetween}>
              <div className={styles.buttonGroup}>
                <Link to="/admin/orderform" className={styles.cancelLink}>
                  취소
                </Link>
                <Button
                  onClick={handleSave}
                  label="저장"
                  className={styles.saveButton}
                />
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  label="삭제"
                  variant="danger"
                  className={styles.deleteButton}
                />
              </div>
            </div>
          </>
        )}
      </main>
      <Modal
        isOpen={modalInfo.isOpen}
        onClose={closeModal}
        title={modalInfo.title}
        message={modalInfo.message}
      />
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="주문서 양식 삭제"
        message="정말로 이 주문서 양식을 삭제하시겠습니까?"
        confirmLabel="삭제"
        onConfirm={handleDelete}
        cancelLabel="취소"
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
