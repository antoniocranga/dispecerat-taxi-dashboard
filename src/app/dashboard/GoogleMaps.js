'use client';

import { useDriversContext } from "@/lib/context/DriversContext";
import theme from "@/theme";
import { CarCrash, Close, DirectionsCar } from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, IconButton, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import GoogleMap from 'google-map-react';

const mapStypes = {
    width: '100%',
}

export default function GoogleMaps() {
    const { drivers, highlitedDriver, setHighlitedDriver } = useDriversContext();

    const defaultProps = {
        center: {
            lat: 45.177656,
            lng: 28.799860
        },
        zoom: 14,
        options: {
            // draggable: false,
            // zoomControl: false,
            scrollwheel: false,
            disabeDoubleClickZoom: true,
            fullscreenControl: false
        }
    }



    return (
        <Box height={"100%"} width={"100%"}>
            <GoogleMap
                bootstrapURLKeys={{
                    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                }}
                defaultCenter={defaultProps.center}
                defaultZoom={defaultProps.zoom}
                options={defaultProps.options}
                yesIWantToUseGoogleMapApiInternals
            >

                {drivers && drivers.map((driver, index) => <CarMarker key={index} driver={driver} lat={driver.lat} lng={driver.lng} />)}

            </GoogleMap>
            {highlitedDriver &&
                <Card
                    variant="outlined"
                    sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 10,
                        minWidth: '150px'
                    }}>
                    <CardContent>
                        <List disablePadding>
                            <ListItem disablePadding sx={{
                                display: "flex",
                                justifyContent: "space-between"
                            }}>
                                <Typography variant="h6">{highlitedDriver.number}</Typography>
                                <IconButton onClick={() => {
                                    setHighlitedDriver(null);
                                }} size="small"><Close /></IconButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemAvatar>
                                    <Avatar sx={{ background: highlitedDriver.available ? theme.palette.success.main : theme.palette.error.main }}>
                                        <CarCrash />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={highlitedDriver.available ? "Liber" : "Ocupat"} secondary="Status" />
                            </ListItem>
                            {/* <ListItem disableGutters>
                                <ListItemText primary="Status" />
                            </ListItem> */}
                        </List>
                    </CardContent>
                </Card>
            }
        </Box>
    );
}

const CarMarker = ({ driver }) => {
    const { drivers, setHighlitedDriver } = useDriversContext();
    return (
        <Card
            variant="outlined"
            sx={{
                display: "flex",
                width: '50px',
                alignItems: "center",
                justifyContent: "center",
                paddingX: '0.5rem',
                paddingY: '0.1rem',
            }}
            onClick={() => {
                setHighlitedDriver(driver);
            }}
        >
            <DirectionsCar sx={{
                color: driver.available ? theme.palette.success.main : theme.palette.error.main
            }} fontSize="small" />
            <Typography variant="body2" fontWeight={"600"}>{driver.number}</Typography>

        </Card>
    )
}