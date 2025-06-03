import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Slider,
  Box,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Button,
} from '@mui/material';
import './VolatilityPlot.css';

const VolatilityPlot = () => {
  const [data, setData] = useState<any[]>([]);
  const [mode, setMode] = useState<'range' | 'fields'>('range');

  const [strike, setStrike] = useState<number[]>([2000, 10000]);
  const [days, setDays] = useState<number[]>([50, 300]);
  const [iv, setIv] = useState<number[]>([0.1, 1.0]);

  const fetchData = () => {
    axios
      .get('http://localhost:8000/api/data/', {
        params: {
          strike_min: strike[0],
          strike_max: strike[1],
          days_min: days[0],
          days_max: days[1],
          iv_min: iv[0],
          iv_max: iv[1],
        },
      })
      .then((res) => {
        setData(res.data);
      });
  };

  useEffect(() => {
    axios.get('http://localhost:8000/api/metadata/')
      .then((res) => {
        const { strike_min, strike_max, days_min, days_max, iv_min, iv_max } = res.data;

        setStrike([strike_min, strike_max]);
        setDays([days_min, days_max]);
        setIv([iv_min, iv_max]);

        fetchData();
      });
  }, []);



  const strikes = useMemo(() => Array.from(new Set(data.map(d => d.strike))).sort((a, b) => a - b), [data]);
  const daysUnique = useMemo(() => Array.from(new Set(data.map(d => d.days_to_expiration))).sort((a, b) => a - b), [data]);
  const z = useMemo(() => daysUnique.map(day =>
    strikes.map(strikeVal => {
      const point = data.find(d => d.strike === strikeVal && d.days_to_expiration === day);
      return point ? point.implied_volatility : 0;
    })
  ), [data, strikes, daysUnique]);


  const plotData = [
    {
      x: strikes,
      y: daysUnique,
      z: z,
      type: 'surface',
      colorscale: 'Viridis',
    },
  ];

  return (
    <Container maxWidth="xl" className="container">
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Typography variant="h4" className="title" align="center">
          Implied Volatility Surface Dashboard
        </Typography>
      </Box>


      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
        }}
      >

        <Box sx={{ flexBasis: { xs: '100%', md: '33.33%' } }}>
          <Paper className="paper-style" sx={{ p: 3 }}>
            <Typography variant="h6" className="subtitle" gutterBottom>
              Filters
            </Typography>

            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, val) => val && setMode(val)}
              fullWidth
              className="toggle-group"
              sx={{ mt: 2, mb: 3 }}
            >
              <ToggleButton value="range">Range</ToggleButton>
              <ToggleButton value="fields">Fields</ToggleButton>
            </ToggleButtonGroup>

            {mode === 'range' ? (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Strike Range
                  </Typography>
                  <Slider
                    value={strike}
                    onChange={(_, val) => setStrike(val as number[])}
                    valueLabelDisplay="auto"
                    min={2000}
                    max={10000}
                    step={100}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Days to Expiration
                  </Typography>
                  <Slider
                    value={days}
                    onChange={(_, val) => setDays(val as number[])}
                    valueLabelDisplay="auto"
                    min={0}
                    max={300}
                    step={10}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Implied Volatility Range
                  </Typography>
                  <Slider
                    value={iv}
                    onChange={(_, val) => setIv(val as number[])}
                    valueLabelDisplay="auto"
                    min={0}
                    max={2}
                    step={0.05}
                  />
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Strike Price Range
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Min Strike"
                      type="number"
                      value={strike[0]}
                      onChange={(e) => {
                        const val = +e.target.value;
                        setStrike([val, Math.max(val, strike[1])]);
                      }}
                      fullWidth
                      size="small"
                      variant="outlined"
                    />
                    <TextField
                      label="Max Strike"
                      type="number"
                      value={strike[1]}
                      onChange={(e) => {
                        const val = +e.target.value;
                        setStrike([Math.min(val, strike[0]), val]);
                      }}
                      fullWidth
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Days to Expiration
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Min Days"
                      type="number"
                      value={days[0]}
                      onChange={(e) => {
                        const val = +e.target.value;
                        setDays([val, Math.max(val, days[1])]);
                      }}
                      fullWidth
                      size="small"
                      variant="outlined"
                    />
                    <TextField
                      label="Max Days"
                      type="number"
                      value={days[1]}
                      onChange={(e) => {
                        const val = +e.target.value;
                        setDays([Math.min(val, days[0]), val]);
                      }}
                      fullWidth
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Implied Volatility Range
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Min IV"
                      type="number"
                      value={iv[0]}
                      onChange={(e) => {
                        const val = +e.target.value;
                        setIv([val, Math.max(val, iv[1])]);
                      }}
                      fullWidth
                      size="small"
                      variant="outlined"
                    />
                    <TextField
                      label="Max IV"
                      type="number"
                      value={iv[1]}
                      onChange={(e) => {
                        const val = +e.target.value;
                        setIv([Math.min(val, iv[0]), val]);
                      }}
                      fullWidth
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>



              </>
            )}
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 0 }}
              onClick={fetchData}
            >
              Apply Filters
            </Button>

            <Paper
              variant="outlined"
              sx={{
                mt: 4,
                p: 2,
                backgroundColor: '#f9fafc',
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Current Filter Summary
              </Typography>
              <Box>
                <Box mb={1}>
                  <Typography variant="body2">
                    <strong>📈 Strike:</strong> {strike[0]} – {strike[1]}
                  </Typography>
                </Box>
                <Box mb={1}>
                  <Typography variant="body2">
                    <strong>⏱️ Days:</strong> {days[0]} – {days[1]}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">
                    <strong>📊 IV:</strong> {iv[0]} – {iv[1]}
                  </Typography>
                </Box>
              </Box>
            </Paper>

          </Paper>
        </Box>

        <Box sx={{ flexBasis: { xs: '100%', md: '66.67%' } }}>
          <Paper className="paper-style">
            <Box sx={{ height: 600 }}>
              <Plot
                data={plotData}
                layout={{
                  autosize: true,
                  height: 600,
                  scene: {
                    xaxis: { title: { text: 'Strike' } },
                    yaxis: { title: { text: 'Days to Expiration' } },
                    zaxis: { title: { text: 'Implied Volatility' } },
                  },
                  margin: { l: 0, r: 0, b: 0, t: 30 },
                }}
                style={{ width: '100%', height: '100%' }}
                config={{ responsive: true }}
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};


export default VolatilityPlot;