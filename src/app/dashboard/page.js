"use client";

import theme from "@/theme";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import GoogleMaps from "./GoogleMaps";
import { Delete, Logout, Phone, PinDrop, Search } from "@mui/icons-material";
import { useEffect, useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import { useAuthentication } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";

export default function Dashboard() {
  const router = useRouter();

  const initialState = {
    phone: "",
    details: "",
    address: "",
    suggestions: "",
    place: "",
    loading: false,
    sent: false,
    error: null,
  };

  const [state, setState] = useState(initialState);

  const url = "https://places.googleapis.com/v1/places:autocomplete";

  const { user, loading, setLoading } = useAuthentication();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user]);

  async function makeRequest(text) {
    if (text && text.length > 0) {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: text,
          // locationRestriction: {
          //     circle: {
          //         center: {
          //             latitude: 45.177656,
          //             longitude: 28.799860
          //         },
          //         radius: 5000.0
          //     }
          // },
          includedRegionCodes: ["ro"],
          languageCode: "ro",
        }),
      });
      const data = await res.json();
      setState({ ...state, suggestions: data.suggestions });
    } else {
      setState({ ...state, suggestions: [] });
    }
  }

  const resetAction = () => {
    setState(initialState);
  };

  const handleOrder = async () => {
    setState({ ...state, loading: true });
    const data = {
      placeId: state.place.placeId,
      phone: state.phone,
      details: state.details,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        resetAction();
        setState({ ...state, loading: false, sent: true, error: null });
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      setState({ ...state, loading: false, sent: true, error: error.message });
    }
  };

  const handleClose = () => {
    setState({ ...state, sent: false });
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">Dispecerat Taxi</Typography>
          <IconButton
            onClick={async () => {
              try {
                setLoading(true);
                await signOut(auth);
              } catch (e) {
              } finally {
                setLoading(false);
              }
            }}
          >
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Grid
        container
        sx={{
          height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
        }}
      >
        <Grid
          item
          xs={6}
          md={4}
          lg={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            paddingTop: "1rem",
            paddingLeft: "1rem",
            paddingRight: "1rem",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <Card variant="outlined">
            <CardContent
              sx={{
                display: "flex",
                gap: "1rem",
                flexDirection: "column",
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Cauta adresa"
                value={state.address}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Search />{" "}
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => {
                  makeRequest(e.target.value);
                  setState({ ...state, address: e.target.value });
                }}
                disabled={state.loading}
              />
              {state.suggestions && state.suggestions.length > 0 && (
                <List>
                  {state.suggestions.map((value, index) => {
                    const prediction = value.placePrediction;
                    return (
                      <ListItemButton
                        key={index}
                        sx={{
                          borderRadius: "16px",
                        }}
                        onClick={() => {
                          setState({ ...state, place: prediction });
                        }}
                        disabled={state.loading}
                      >
                        <ListItemIcon>
                          <PinDrop />
                        </ListItemIcon>
                        <ListItemText
                          primary={prediction.text.text}
                        ></ListItemText>
                      </ListItemButton>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <Typography variant="h6">Comanda noua</Typography>
              {state.place && (
                <List>
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        disabled={state.loading}
                        onClick={() => setState({ ...state, place: null })}
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <PinDrop />
                    </ListItemIcon>
                    <ListItemText
                      primary={state.place.text.text}
                    ></ListItemText>
                  </ListItem>
                </List>
              )}
              <TextField
                fullWidth
                size="small"
                placeholder="Numar de telefon"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => {
                  const re = /^[0-9\b]+$/;
                  if (e.target.value === "" || re.test(e.target.value)) {
                    setState({ ...state, phone: e.target.value });
                  }
                }}
                value={state.phone}
                disabled={state.loading}
              ></TextField>
              <TextField
                fullWidth
                multiline
                size="small"
                placeholder="Alte detalii"
                minRows={3}
                onChange={(e) => {
                  setState({ ...state, details: e.target.value });
                }}
                value={state.details}
                disabled={state.loading}
              ></TextField>
              <LoadingButton
                variant="contained"
                loading={state.loading}
                onClick={handleOrder}
                size="large"
              >
                Plaseaza comanda
              </LoadingButton>
              <Button
                variant="outlined"
                onClick={resetAction}
                disabled={state.loading}
                size="large"
              >
                Reseteaza
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={8} lg={9} sx={{ background: "black" }}>
          <GoogleMaps />
        </Grid>
      </Grid>
      <Snackbar open={state.sent} autoHideDuration={5000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={state.error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {state.error
            ? `Comanda nu s-a putut realiza. ${state.error}`
            : "Comanda a fost trimisa cu succes."}
        </Alert>
      </Snackbar>
    </Box>
  );
}
