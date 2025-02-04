import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { DriversProvider } from "@/lib/context/DriversContext";
import { AuthProvider } from "@/lib/context/AuthContext";
import theme from "@/theme";
import FullScreenCircularProgress from "@/lib/components/FullScreenCircularProgress";
import { OrdersProvider } from "@/lib/context/OrdersContext";

export default function RootLayout(props) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <AuthProvider>
              <DriversProvider>
                <OrdersProvider>
                  <FullScreenCircularProgress>
                    {props.children}
                  </FullScreenCircularProgress>
                </OrdersProvider>
              </DriversProvider>
            </AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
