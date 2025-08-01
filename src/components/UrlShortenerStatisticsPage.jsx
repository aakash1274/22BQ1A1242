import React from 'react';
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from '@mui/material';

export default function UrlShortenerStatisticsPage() {
  const shortenedLinks = JSON.parse(localStorage.getItem('shortenedLinks') || '[]');

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Shortened URLs Statistics</Typography>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Short URL</TableCell>
              <TableCell>Original URL</TableCell>
              <TableCell>Expires At</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shortenedLinks.map((link, idx) => {
              const expired = Date.now() > link.expiryAt;
              return (
                <TableRow key={idx}>
                  <TableCell>
                    <a href={link.originalUrl} target="_blank" rel="noopener noreferrer">{link.shortUrl}</a>
                  </TableCell>
                  <TableCell style={{ wordBreak: 'break-word' }}>{link.originalUrl}</TableCell>
                  <TableCell>{new Date(link.expiryAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {expired ? (
                      <span style={{ color: 'red' }}>Expired</span>
                    ) : (
                      <span style={{ color: 'green' }}>Active</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {shortenedLinks.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No URLs shortened yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
