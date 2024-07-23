"use client"

import { useAuthentication } from "@/lib/context/AuthContext";
import { auth } from "@/lib/firebase/firebase";
import { Box, Button, Grid, TextField } from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Authentication() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { user } = useAuthentication();

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Login error:', error.message);
        }
    }

    return <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent={"center"}
        sx={{
            minHeight: '100vh'
        }}
    >
        <Box component="form" onSubmit={handleLogin} sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
        }}>
            <TextField

                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            >

            </TextField>
            <TextField type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required>

            </TextField>
            <Button type="submit" variant="contained">Log in</Button>
        </Box>
    </Grid>
}