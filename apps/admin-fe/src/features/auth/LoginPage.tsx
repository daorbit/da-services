import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paper, TextInput, PasswordInput, Button, Title, Stack, Alert } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { login } from "./authSlice";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) navigate("/");
  }

  return (
    <Stack align="center" justify="center" mih="100vh">
      <Paper withBorder shadow="sm" p="xl" w={360}>
        <Title order={3} mb="md">DA Services Admin</Title>
        <form onSubmit={handleSubmit}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}
            <TextInput
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />
            <Button type="submit" loading={status === "loading"}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
