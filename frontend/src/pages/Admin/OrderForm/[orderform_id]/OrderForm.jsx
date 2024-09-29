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
  const { orderform_id } = useParams();
  const navigate = useNavigate();
  const { data: formData, isLoading, isError } = useFormDetails(orderform_id);
  const { data: allCategoriesData, isLoading: isCategoriesLoading } =
    useCategories();
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

  const form = formData?.data;
  const allCategories = allCategoriesData?.data;

  console.log(form);

  const measurementUnitMapping = {
    자켓소매: "jacketSleeve",
    자켓길이: "jacketLength",
    자켓폼: "jacketForm",
    바지둘레: "pantsCircumference",
    바지길이: "pantsLength",
    셔츠목: "shirtNeck",
    셔츠소매: "shirtSleeve",
    드레스등폼: "dressBackForm",
    드레스길이: "dressLength",
  };

  useEffect(() => {
    if (form) {
      setFormName(form.name);

      // 카테고리 설정
      setSelectedCategories(form.categories);

      // 수선 정보 설정
      const initialMeasurementUnits = Object.entries(
        measurementUnitMapping
      ).reduce((acc, [key, value]) => {
        acc[key] = form[value] ? form[value].toUpperCase() : "CM";
        return acc;
      }, {});
      setMeasurementUnits(initialMeasurementUnits);
    }
  }, [form]);

  const addCategory = () => {
    if (allCategories && allCategories.length > 0) {
      const newCategory = allCategories.find(
        (cat) => !selectedCategories.some((selected) => selected.id === cat.id)
      );
      if (newCategory) {
        setSelectedCategories([...selectedCategories, newCategory]);
      }
    }
  };

  const removeCategory = (index) => {
    setSelectedCategories(selectedCategories.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (index, newCategoryId) => {
    const newCategory = allCategories.find(
      (cat) => cat.id === parseInt(newCategoryId)
    );
    if (newCategory) {
      const updatedCategories = [...selectedCategories];
      updatedCategories[index] = newCategory;
      setSelectedCategories(updatedCategories);
    }
  };

  const handleSave = async () => {
    try {
      const updatedForm = {
        name: formName,
        ...Object.entries(measurementUnits).reduce((acc, [key, value]) => {
          acc[measurementUnitMapping[key]] = value.toLowerCase(); // API expects lowercase
          return acc;
        }, {}),
        categories: selectedCategories.map((category) => category.id),
      };
      // console.log(updatedForm);
      await updateFormMutation.mutateAsync({
        formId: orderform_id,
        formData: updatedForm,
      });
      setModalInfo({
        isOpen: true,
        title: "성공",
        message: "주문서 양식이 성공적으로 수정되었습니다.",
      });
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

  const handleMeasurementUnitChange = (field, value) => {
    setMeasurementUnits({ ...measurementUnits, [field]: value });
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteFormMutation.mutateAsync(orderform_id);
      setIsDeleteModalOpen(false);
      setModalInfo({
        isOpen: true,
        title: "성공",
        message: "주문서 양식이 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      console.error("Delete form error:", error);
      setIsDeleteModalOpen(false);
      setModalInfo({
        isOpen: true,
        title: "오류",
        message:
          "주문서 양식 삭제에 실패했습니다: " +
          (error.response?.data?.detail || error.message),
      });
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
                        <option value="INCH">inch</option>
                        <option value="CM">cm</option>
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
        message="이 주문서 양식을 삭제하시겠습니까?"
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
