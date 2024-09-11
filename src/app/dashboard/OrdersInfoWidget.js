import { useOrdersContext } from "@/lib/context/OrdersContext";
import {
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

export default function OrderInfoWidget() {
  const { pendingOrders, noDriverOrders, manualRetryOrder } =
    useOrdersContext();
  return (
    <Card
      variant="outlined"
      sx={{
        margin: "1rem",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "300px",
          overflowY: "auto",
          //   gap: "1rem",
        }}
      >
        <Typography fontWeight={"600"}>Comenzi</Typography>
        <List dense>
          {pendingOrders && pendingOrders.length > 0 && (
            <Typography variant="body2">Comenzi in asteptare.</Typography>
          )}
          {pendingOrders &&
            pendingOrders.length > 0 &&
            pendingOrders.map((order, index) => {
              return (
                <ListItem key={order.id} disableGutters>
                  <ListItemText primary={order.phone}></ListItemText>
                </ListItem>
              );
            })}
        </List>
        <List dense>
          {noDriverOrders && noDriverOrders.length > 0 && (
            <Typography variant="body2">Comenzi esuate.</Typography>
          )}
          {noDriverOrders &&
            noDriverOrders.length > 0 &&
            noDriverOrders.map((order, index) => {
              return (
                <ListItem key={order.id} disableGutters>
                  <ListItemText primary={order.phone}></ListItemText>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      manualRetryOrder(order.id);
                    }}
                    sx={{
                      marginLeft: "1rem"
                    }}
                  >
                    Retrimite
                  </Button>
                </ListItem>
              );
            })}
        </List>
      </CardContent>
    </Card>
  );
}
