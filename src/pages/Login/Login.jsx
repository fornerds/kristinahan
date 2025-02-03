import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Input } from "../../components";
import { useLogin } from "../../api/hooks";

const schema = yup
  .object({
    password: yup.string().required("비밀번호를 입력하세요"),
  })
  .required();

export const Login = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState(null);
  const login = useLogin();

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
      const result = await login.mutateAsync({
        id: 1,
        password: data.password,
      });
      localStorage.setItem("token", result?.data.access_token);
      navigate("/event");
    } catch (error) {
      setLoginError("로그인에 실패했습니다. 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className={styles.loginBackground}>
      <section className={styles.formWrap}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formTitleWrap}>
            <h2>환영합니다</h2>
            <p>크리스티나한 주문서 작성 및 관리 서비스입니다</p>
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

          {loginError && <p className={styles.errorMessage}>{loginError}</p>}

          <Button
            variant="default"
            size="full"
            type="submit"
            label={isSubmitting ? "로그인 중.." : "로그인하기"}
            disabled={isSubmitting}
          />
        </form>
      </section>
    </div>
  );
};
