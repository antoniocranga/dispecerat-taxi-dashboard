import { Logout } from "@mui/icons-material";
import { AppBar, Box, Container, IconButton, Toolbar, Typography } from "@mui/material";

export default function TermsAndConditions() {
    return (<Box>
        <AppBar position="static">
            <Toolbar sx={{
                display: "flex",
                justifyContent: "space-between"
            }}>
                <Typography variant="h6">Dispecerat Taxi</Typography>
                <Logout />
            </Toolbar>
        </AppBar >
        <Container maxWidth="lg">
            
        </Container>
    </Box>);
}