import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import UrlShortenerPage from './components/UrlShortenerPage';
import UrlShortenerStatisticsPage from './components/UrlShortenerStatisticsPage';

function App() {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box mb={4}>
        <Typography variant="h3" align="center" gutterBottom>
          URL Shortener Web App
        </Typography>
      </Box>
      <UrlShortenerPage />
      <UrlShortenerStatisticsPage />
    </Container>
  );
}

export default App;
