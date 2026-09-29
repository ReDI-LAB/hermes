import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';


const categories = ['Drinks', 'Food', 'Ride', 'Game', 'Merchandise'];

export default function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: ' #1d3537' }}>
      {/* Header */}
      <AppBar
        position='static'
        elevation={0}
        sx={{ bgcolor: '#44b7c1', color: '#111' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant='subtitle2' fontWeight={600}>
            Hermes
          </Typography>
          <IconButton edge='end' color='inherit' aria-label='menu'>
            <MenuIcon fontSize='small' />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth='xs' sx={{ pt: 8, pb: 6 }}>
        <Typography
          variant='h5'
          align='center'
          fontWeight={600}
          sx={{ lineHeight: 1.25, bgcolor: '#1d3537', color: '#d8e9e7' }}
        >
          Find the best prices
          <br />
          at Oktoberfest
        </Typography>

        <Typography
          variant='body2'
          align='center'
          color='text.secondary'
          sx={{ 
            mt: 2, mb: 4, bgcolor: '#1d3537', color: '#d8e9e7'}}
        >
          Search for a product, set your budget
          <br />
          and compare vendors.
        </Typography>

        {/* Search (static) */}
        <Paper
          variant='outlined'
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 0.75,
            mb: 4,
            borderRadius: 2,
            bgcolor: '#F8F9FA',
          }}
        >
          <SearchIcon fontSize='small' sx={{ color: 'text.secondary' }} />
          <InputBase
            placeholder='Search for a product'
            sx={{ ml: 2, flex: 1, fontSize: 14 }}
            inputProps={{ 'aria-label': 'search for a product' }}
          />
        </Paper>

        {/* Categories */}
        <Stack spacing={2}>
          {categories.map((name) => (
            <Button
              key={name}
              fullWidth
              disableElevation
              sx={{
                py: 1.5,
                borderRadius: 2,
                bgcolor: '#EEF2F5',
                color: '#111',
                fontSize: 18,
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': { bgcolor: '#E2E8ED' },
              }}
            >
              {name}
            </Button>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
