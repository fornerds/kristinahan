import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Input, Link } from "../../../../components";
import { Modal, TabNavigation } from "../../../../modules";
import { ReactComponent as DeleteIcon } from "../../../../asset/icon/delete.svg";
import styles from "./OrderForm.module.css";
import {
  useFormDetails,
  useUpdateForm,
  useDeleteForm,
  useCategories,
} from "../../../../api/hooks";

export const OrderForm = () => {
  const { formID } = useParams();
  const navigate = useNavigate();
  const { data: form, isLoading, isError } = useFormDetails(formID);
  const { data: allCategories } = useCategories();
  const updateFormMutation = useUpdateForm();
  const deleteFormMutation = useDeleteForm();

  const [formName, setFormName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [measurementUnits, setMeasurementUnits] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    if (form) {
      setFormName(form.name);
      setSelectedCategories(form.categories);
      setMeasurementUnits({
        jacketSleeve: form.jacketSleeve,
        jacketLength: form.jacketLength,
        jacketForm: form.jacketForm,
        pantsCircumference: form.pantsCircumference,
        pantsLength: form.pantsLength,
        shirtNeck: form.shirtNeck,
        shirtSleeve: form.shirtSleeve,
        dressBackForm: form.dressBackForm,
        dressLength: form.dressLength,
      });
    }
  }, [form]);

  const addCategory = () => {
    if (allCategories && allCategories.length > 0) {
      const newCategoryId = allCategories[0].id;
      if (!selectedCategories.includes(newCategoryId)) {
        setSelectedCategories([...selectedCategories, newCategoryId]);
      }
    }
  };

  const removeCategory = (index) => {
    setSelectedCategories(selectedCategories.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (index, value) => {
    const updatedCategories = [...selectedCategories];
    updatedCategories[index] = Number(value);
    setSelectedCategories(updatedCategories);
  };

  const handleMeasurementUnitChange = (field, value) => {
    setMeasurementUnits({ ...measurementUnits, [field]: value });
  };

  const handleSave = async () => {
    try {
      const updatedForm = {
        name: formName,
        ...measurementUnits,
        categories: selectedCategories,
      };
      await updateFormMutation.mutateAsync({ formID, formData: updatedForm });
      setModalInfo({
        isOpen: true,
        title: "성공",
        message: "주문서 양식이 성공적으로 수정되었습니다.",
      });
    } catch (error) {
      setModalInfo({
        isOpen: true,
        title: "오류",
        message: "주문서 양식 수정에 실패했습니다: " + error.message,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteFormMutation.mutateAsync(formID);
      setModalInfo({
        isOpen: true,
        title: "성공",
        message: "주문서 양식이 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      setModalInfo({
        isOpen: true,
        title: "오류",
        message: "주문서 양식 삭제에 실패했습니다: " + error.message,
      });
    }
    setIsDeleteModalOpen(false);
  };

  const closeModal = () => {
    setModalInfo({ isOpen: false, title: "", message: "" });
    if (modalInfo.title === "성공") {
      navigate("/admin/orderform");
    }
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>에러가 발생했습니다.</div>;

  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>주문서 양식 관리</h2>
        {isLoading ? (
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
                      {selectedCategories.map((categoryId, index) => (
                        <tr key={index}>
                          <td>
                            <select
                              value={categoryId}
                              onChange={(e) =>
                                handleCategoryChange(index, e.target.value)
                              }
                              className={styles.select}
                            >
                              {allCategories?.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
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
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>수선정보</h3>
                <div className={styles.sectionGroupWrap}>
                  {Object.entries(measurementUnits).map(([key, value]) => (
                    <div key={key} className={styles.sectionVerticalGroup}>
                      <span className={styles.sectionLabel}>{key}</span>
                      <select
                        value={value}
                        onChange={(e) =>
                          handleMeasurementUnitChange(key, e.target.value)
                        }
                        className={styles.select}
                      >
                        <option value="inch">inch</option>
                        <option value="cm">cm</option>
                      </select>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <div className={styles.spacebetween}>
              <Button
                onClick={handleDelete}
                label="삭제"
                className={styles.deleteButton}
                variant="danger"
              />
              <div className={styles.buttonGroup}>
                <Link to="/admin/orderform" className={styles.cancelLink}>
                  취소
                </Link>
                <Button
                  onClick={handleSave}
                  label="저장"
                  className={styles.saveButton}
                />
              </div>
            </div>
          </>
        )}
      </main>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="주문서 양식 삭제"
        message="정말로 이 주문서 양식을 삭제하시겠습니까?"
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        cancelLabel="취소"
        onCancel={() => setIsDeleteModalOpen(false)}
      />
      <Modal
        isOpen={modalInfo.isOpen}
        onClose={closeModal}
        title={modalInfo.title}
        message={modalInfo.message}
      />
    </div>
  );
};
