export type LoginInput = {
  email: string;
  password: string;
};

export const login = async (values: LoginInput) => {
  const res = await fetch("https://your-api.com/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
};