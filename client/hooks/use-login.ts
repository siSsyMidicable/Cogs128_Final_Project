import { useMutation } from "@tanstack/react-query";
import { login, LoginInput } from "../app/auth/api/login";
export const useLogin = () => {
  return useMutation({
    mutationFn: (values: LoginInput) => login(values),
  });
};