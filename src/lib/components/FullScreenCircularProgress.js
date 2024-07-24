"use client";

import { CircularProgress, Container } from "@mui/material";
import { useAuthentication } from "@/lib/context/AuthContext";

export default function FullScreenCircularProgress({ children }) {
  const { loading, user } = useAuthentication();
  return (
    <>
      {loading && (
        <Container
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            // minWidth: "100vh",
          }}
        >
          <CircularProgress />
        </Container>
      )}
      {!loading && children}
    </>
  );
}
