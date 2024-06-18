"use client";

import theme from "@/theme";
import { AppBar, Box, Button, Card, CardContent, Grid, IconButton, InputAdornment, List, ListItem, ListItemButton, ListItemIcon, ListItemText, TextField, Toolbar, Typography } from "@mui/material";
import GoogleMaps from "./GoogleMaps";
import { Delete, Phone, PinDrop, Search } from "@mui/icons-material";
import { NextResponse } from "next/server";
import { useState } from "react";
import LoadingButton from '@mui/lab/LoadingButton';

export default function Dashboard() {
    const [phone, setPhone] = useState("");
    const [details, setDetails] = useState("");

    const [suggestions, setSuggestions] = useState([]);
    const [place, setPlace] = useState(null);

    const [loading, setLoading] = useState(false);

    const url = "https://places.googleapis.com/v1/places:autocomplete";

    async function makeRequest(text) {
        if (text && text.length > 0) {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    input: text,
                    locationRestriction: {
                        circle: {
                            center: {
                                latitude: 45.177656,
                                longitude: 28.799860
                            },
                            radius: 5000.0
                        }
                    },
                    includedRegionCodes: ["ro"],
                    languageCode: "ro"
                })
            });
            const data = await res.json();
            setSuggestions(data.suggestions);
        } else {
            setSuggestions([]);
        }
    }

    const resetAction = () => {
        setSuggestions([]);
        setPlace(null);
        setPhone("");
        setDetails("");
    }

    const handleOrder = async () => {
        setLoading(true);
        const data = {
            placeId: place.placeId,
            phone: phone,
            details: details,
        }

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            // console.log(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (<Box>
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6">Dispecerat Taxi</Typography>
            </Toolbar>
        </AppBar>
        <Grid container sx={{
            height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`
        }}>
            <Grid item xs={3} sx={{
                display: "flex",
                flexDirection: "column",
                paddingTop: '1rem',
                paddingLeft: '1rem',
                paddingRight: '1rem',
                gap: '1rem'
            }}>
                <Card variant="outlined">
                    <CardContent sx={{
                        display: "flex",
                        gap: '1rem',
                        flexDirection: 'column'
                    }}>
                        <TextField fullWidth size="small" placeholder="Cauta adresa" InputProps={{
                            endAdornment: <InputAdornment position="end"><Search /> </InputAdornment>
                        }} onChange={(e) => {
                            makeRequest(e.target.value);
                        }} disabled={loading}/>
                        {suggestions && suggestions.length > 0 &&
                            <List>
                                {
                                    suggestions.map((value, index) => {
                                        const prediction = value.placePrediction;
                                        return (<ListItemButton key={index} sx={{
                                            borderRadius: '16px'
                                        }} onClick={() => {
                                            setPlace(prediction);
                                        }} disabled={loading}>
                                            <ListItemIcon ><PinDrop /></ListItemIcon>
                                            <ListItemText primary={prediction.text.text}></ListItemText>
                                        </ListItemButton>);
                                    })}
                            </List>
                        }

                    </CardContent>
                </Card>
                <Card variant="outlined">
                    <CardContent sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: '1rem'
                    }}>
                        <Typography variant="h6">Comanda noua</Typography>
                        {place && <List>
                            <ListItem secondaryAction={
                                <IconButton edge="end" aria-label="delete" disabled={loading} onClick={() => setPlace(null)}>
                                    <Delete />
                                </IconButton>
                            }>
                                <ListItemIcon><PinDrop /></ListItemIcon>
                                <ListItemText primary={place.text.text}></ListItemText>
                            </ListItem>
                        </List>}
                        <TextField fullWidth size="small" placeholder="Numar de telefon" required InputProps={{
                            endAdornment: <InputAdornment position="end"><Phone /></InputAdornment>
                        }} onChange={(e) => { setPhone(e.target.value); }} value={phone} disabled={loading}>

                        </TextField>
                        <TextField fullWidth multiline size="small" placeholder="Alte detalii" minRows={3}></TextField>
                        <LoadingButton variant="contained" loading={loading} onClick={handleOrder}>Plaseaza comanda</LoadingButton>
                        <Button variant="outlined" onClick={resetAction} disabled={loading}>Reseteaza</Button>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={9} sx={{ background: "black" }}>
                <GoogleMaps />
            </Grid>
        </Grid>
    </Box>);
}