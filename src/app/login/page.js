"use client";

import { useAuthentication } from "@/lib/context/AuthContext";
import { auth } from "@/lib/firebase/firebase";
import { LoadingButton } from "@mui/lab";
import { Box, Grid, TextField } from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Authentication() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { user, loading } = useAuthentication();

  const [errors, setErrors] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [loading, user]);

  const validateForm = () => {
    let errors = {};
    if (!email) {
      errors.email = "Email necesar.";
    }
    if (!password) {
      errors.password = "Introduceti parola.";
    } else if (password.length < 6) {
      errors.password = "Parola trebuie sa contina cel putin 6 caractere.";
    }
    let hasErrors = Object.keys(errors).length !== 0;
    setErrors(errors);
    if (!hasErrors) {
      handleLogin();
    }
  };

  const handleLogin = async (e) => {
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setErrors({ email: "Emailul sau parola sunt incorecte." });

      setIsLoading(false);
    }
  };

  return (
    !user && (
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent={"center"}
        sx={{
          minHeight: "100vh",
        }}
      >
        <Box
          // component="form"
          // onSubmit={handleLogin}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <TextField
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            error={errors.email}
            helperText={errors.email}
            required
            disabled={isLoading}
          ></TextField>
          <TextField
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            error={errors.password}
            helperText={errors.password}
            required
            disabled={isLoading}
          ></TextField>
          <LoadingButton
            variant="contained"
            size="large"
            onClick={() => {
              validateForm();
              // handleLogin();
            }}
            loading={isLoading}
          >
            Log in
          </LoadingButton>
        </Box>
      </Grid>
    )
  );
}
