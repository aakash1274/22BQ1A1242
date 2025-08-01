import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { logAction } from './LoggerMiddleware';

const SHORT_URL_PREFIX = "https://sho.rt/";

function generateRandomShortCode(existingShortCodes) {
  let code;
  do {
    code = Math.random().toString(36).substr(2, 6);
  } while (existingShortCodes.has(code));
  return code;
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return !!parsed.host;
  } catch {
    return false;
  }
}

const initialForms = Array(5).fill().map(() => ({
  originalUrl: '',
  customCode: '',
  validity: '',
  error: '',
}));

export default function UrlShortenerPage() {
  const [forms, setForms] = useState(initialForms);


  const [shortenedLinks, setShortenedLinks] = useState(() => {
    const data = localStorage.getItem('shortenedLinks');
    return data ? JSON.parse(data) : [];
  });


  useEffect(() => {
    localStorage.setItem('shortenedLinks', JSON.stringify(shortenedLinks));
  }, [shortenedLinks]);

  function handleChange(index, field, value) {
    const updatedForms = [...forms];
    updatedForms[index][field] = value;
    updatedForms[index].error = ''; 
    setForms(updatedForms);
  }


  function handleShorten() {
    const allShortCodes = new Set(shortenedLinks.map(l => l.shortCode));
    const newLinks = [];
    const updatedForms = [...forms];

    forms.forEach((form, idx) => {
      if (!form.originalUrl.trim()) return; 


      if (!isValidUrl(form.originalUrl.trim())) {
        updatedForms[idx].error = "Invalid URL";
        logAction('INVALID_URL', { index: idx, input: form.originalUrl.trim() });
        return;
      }


      let shortCode = "";
      if (form.customCode.trim()) {
        if (!/^[a-zA-Z0-9]{3,12}$/.test(form.customCode.trim())) {
          updatedForms[idx].error = "Shortcode must be alphanumeric (3-12 chars)";
          logAction('INVALID_SHORTCODE', { index: idx, input: form.customCode.trim() });
          return;
        }
        if (allShortCodes.has(form.customCode.trim()) || newLinks.some(l => l.shortCode === form.customCode.trim())) {
          updatedForms[idx].error = "Shortcode already exists";
          logAction('SHORTCODE_COLLISION', { index: idx, input: form.customCode.trim() });
          return;
        }
        shortCode = form.customCode.trim();
      } else {
   
        shortCode = generateRandomShortCode(allShortCodes);
      }


      let expiryMinutes = parseInt(form.validity, 10);
      if (isNaN(expiryMinutes) || expiryMinutes <= 0) expiryMinutes = 30;

      const expiryTimestamp = Date.now() + expiryMinutes * 60 * 1000;


      newLinks.push({
        originalUrl: form.originalUrl.trim(),
        shortCode,
        shortUrl: SHORT_URL_PREFIX + shortCode,
        expiryAt: expiryTimestamp,
        createdAt: Date.now(),
      });

      allShortCodes.add(shortCode);

      logAction('URL_SHORTENED', {
        index: idx,
        originalUrl: form.originalUrl.trim(),
        shortCode,
        expiryAt: expiryTimestamp,
      });


      updatedForms[idx] = { originalUrl: '', customCode: '', validity: '', error: '' };
    });

    setForms(updatedForms);

    if (newLinks.length > 0) {
      setShortenedLinks(prev => [...prev, ...newLinks]);
    }
  }

  return (
    <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
      <Typography variant="h6" gutterBottom>Shorten up to 5 URLs</Typography>

      <Grid container spacing={2}>
        {forms.map((form, idx) => (
          <React.Fragment key={idx}>
            <Grid item xs={12} md={5}>
              <TextField
                label="Original URL"
                value={form.originalUrl}
                onChange={e => handleChange(idx, 'originalUrl', e.target.value)}
                size="small"
                fullWidth
                error={!!form.error}
                helperText={form.error}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                label="Custom Shortcode (optional)"
                value={form.customCode}
                onChange={e => handleChange(idx, 'customCode', e.target.value)}
                size="small"
                fullWidth
                inputProps={{ maxLength: 12 }}
              />
            </Grid>

            <Grid item xs={6} md={2}>
              <TextField
                label="Validity (minutes, optional)"
                type="number"
                value={form.validity}
                onChange={e => handleChange(idx, 'validity', e.target.value)}
                size="small"
                fullWidth
                inputProps={{ min: 1, max: 10080 }}
                placeholder="30"
              />
            </Grid>
          </React.Fragment>
        ))}

        <Grid item xs={12} md={2} display="flex" alignItems="center">
          <Button variant="contained" onClick={handleShorten} fullWidth>
            Shorten
          </Button>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="subtitle1" gutterBottom>Recently Shortened Links</Typography>
        <Grid container spacing={2}>
          {shortenedLinks.map((link, i) => {
            const isExpired = Date.now() > link.expiryAt;
            return (
              <Grid item xs={12} md={6} key={i}>
                <Paper sx={{ p: 2, bgcolor: isExpired ? '#ffebee' : '#e8f5e9' }}>
                  <Typography variant="body2"><strong>Original:</strong> {link.originalUrl}</Typography>
                  <Typography variant="body2">
                    <strong>Short:</strong>{' '}
                    <a href={link.originalUrl} target="_blank" rel="noopener noreferrer">{link.shortUrl}</a>
                  </Typography>
                  <Typography variant="body2" color={isExpired ? 'error' : 'primary'}>
                    <strong>Expires:</strong>{' '}
                    {isExpired ? "Expired" : new Date(link.expiryAt).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" display="block">Shortcode: {link.shortCode}</Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Paper>
  );
}
