import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';


export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en">
      <body>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Trace Explorer
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ minHeight: 'calc(100vh - 128px)' }}>{children}</Box>
      </Container>
      </body>
      </html>
  );
}