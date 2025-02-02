import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminLogin.module.css";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Input } from "../../../components";
import { useAdminLogin } from "../../../api/hooks";

const schema = yup
  .object({
    password: yup.string().required("비밀번호를 입력하세요"),
  })
  .required();

export const AdminLogin = () => {
  const navigate = useNavigate();
  const adminLogin = useAdminLogin();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const loginData = {
        id: 2,
        password: data.password.trim(),
      };

      console.log("Submitting data:", loginData);
      const response = await adminLogin.mutateAsync(loginData);

      if (response?.data?.access_token) {
        navigate("/admin/writer");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error);
    }
  };

  return (
    <div className={styles.loginBackground}>
      <section className={styles.formWrap}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formTitleWrap}>
            <h2>관리자 로그인</h2>
            <p>크리스티나한 주문서 작성 및 관리 서비스 관리자 페이지</p>
          </div>

          <div className={styles.inputWrap}>
            <label htmlFor="password" className={styles.inputLabel}>
              비밀번호
            </label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                />
              )}
            />
            {errors.password && (
              <p className={styles.errorMessage}>{errors.password.message}</p>
            )}
          </div>

          {adminLogin.error && (
            <p className={styles.errorMessage}>
              로그인에 실패했습니다. 비밀번호를 확인해주세요.
            </p>
          )}

          <Button
            variant="default"
            size="full"
            type="submit"
            label={adminLogin.isLoading ? "로그인 중.." : "로그인하기"}
            disabled={adminLogin.isLoading || isSubmitting}
          />
        </form>
      </section>
    </div>
  );
};
