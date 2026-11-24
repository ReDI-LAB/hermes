
import { useState } from 'react';
import { Box } from '@mui/material';
import { useMediaQuery } from '@uidotdev/usehooks';

import Header from './components/Header';
import Home from './components/Home';
import BrowseScreen from './components/BrowseScreen';
import About from './components/About';

import type { ProductGroup } from './types/types';

type View =
  | { name: 'home' }
  | { name: 'about' }
  | { name: 'browse'; categoryId: string; query: string; productId?: string };

export default function App() {
  const [view, setView] = useState<View>({ name: 'home' });
  const [prev, setPrev] = useState<View>({ name: 'home' });

  // Responsive breakpoints
  const isSmallDevice = useMediaQuery(
    'only screen and (min-width: 320px) and (max-width: 767px)'
  );

  const isMediumDevice = useMediaQuery(
    'only screen and (min-width: 768px) and (max-width: 1023px)'
  );

  const isLargeDevice = useMediaQuery(
    'only screen and (min-width: 1024px) and (max-width: 1439px)'
  );

  const isExtraLargeDevice = useMediaQuery(
    'only screen and (min-width: 1440px)'
  );

  // Navigation
  const go = (v: View) => {
    window.scrollTo({ top: 0 });
    setView(v);
  };

  const openAbout = () => {
    if (view.name !== 'about') {
      setPrev(view);
    }

    go({ name: 'about' });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Header
        onHome={() => go({ name: 'home' })}
        onAbout={openAbout}
      />

      <Box
        component="main"
        sx={{
          // Responsive max-width
          maxWidth: isSmallDevice
            ? 767
            : isMediumDevice
            ? 1023
            : isLargeDevice
            ? 1439
            : isExtraLargeDevice
            ? 1100
            : 560,

          mx: 'auto',

          px: isSmallDevice ? 2 : 3,

          pt: 1.5,

          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        {view.name === 'home' && (
          <Home
            onCategory={(categoryId) =>
              go({ name: 'browse', categoryId, query: '' })
            }
            onSearch={(query) =>
              go({ name: 'browse', categoryId: '', query })
            }
            onPick={(g: ProductGroup) =>
              go({
                name: 'browse',
                categoryId: g.product.category_id,
                query: '',
                productId: g.product.product_id,
              })
            }
          />
        )}

        {view.name === 'about' && (
          <About onBack={() => go(prev)} />
        )}

        {view.name === 'browse' && (
          <BrowseScreen
            key={`${view.categoryId}|${view.query}|${view.productId ?? ''}`}
            initialCategoryId={view.categoryId}
            initialQuery={view.query}
            initialProductId={view.productId}
            onBack={() => go({ name: 'home' })}
          />
        )}
      </Box>
    </Box>
  );
}