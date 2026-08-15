import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TextInput, PasswordInput, Button, Title, Text, Alert, Stack } from "@mantine/core";
import { AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { login } from "./authSlice";
import { AuthBrand } from "./AuthBrand";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const busy = status === "loading";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await dispatch(login({ email: email.trim(), password }));
    if (login.fulfilled.match(result)) navigate("/");
  }

  return (
    <div className="auth-split">
      <AuthBrand />
      <div className="auth-panel">
        <motion.form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stack gap="lg">
            <div>
              <Title order={2}>Sign in</Title>
              <Text c="dimmed" size="sm" mt={4}>
                Admin access only — accounts are provisioned, not self-served.
              </Text>
            </div>

            {error && (
              <Alert color="red" variant="light" icon={<AlertCircle size={16} />}>
                {error}
              </Alert>
            )}

            <TextInput
              label="Email"
              type="email"
              placeholder="you@daorbit.in"
              size="md"
              withAsterisk
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              size="md"
              withAsterisk
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />

            <Button type="submit" loading={busy} fullWidth size="md">
              Sign in
            </Button>
          </Stack>
        </motion.form>
      </div>
    </div>
  );
}
