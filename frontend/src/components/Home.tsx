import { Alert, Box, ButtonBase, Skeleton, Typography } from '@mui/material';
import ChevronRight from '@mui/icons-material/ChevronRight';
import SvgIcon from '@mui/material/SvgIcon';
import { fetchCategories } from '../services/api';
import { useAsync } from '../types/UseAsync';
import { categoryIcon, categoryLabel } from '../categoryUI';
import SearchBox from './SearchBox';
import type { ProductGroup } from '../types/types';
import { c, fonts } from '../types/theme';

interface Props {
  onCategory: (categoryId: string) => void;
  onSearch: (q: string) => void;
  onPick: (g: ProductGroup) => void;
  isTabletOrUp?: boolean;
}

export default function Home({
  onCategory,
  onSearch,
  onPick,
  isTabletOrUp = false,
}: Props) {
  const categories = useAsync((s) => fetchCategories(s), []);
  const list = categories.data ?? [];

  return (
    <Box
      sx={{
        pt: isTabletOrUp ? 4 : 2.5,
        pb: isTabletOrUp ? 6 : 4,
        width: '100%',
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: isTabletOrUp ? 15 : 12,
          letterSpacing: isTabletOrUp ? '.2em' : '.14em',
          color: c.gold,
        }}
      >
        THERESIENWIESE · MÜNCHEN
      </Typography>

      <Typography
        component='h1'
        sx={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: isTabletOrUp ? 54 : 30,
          lineHeight: 1.04,
          color: c.ink,
          mt: 1,
          wordBreak: 'break-word',
        }}
      >
        FIND THE BEST PRICES AT
        <Box
          component='span'
          sx={{
            display: 'block',
            fontFamily: fonts.fraktur,
            fontWeight: 700,
            fontSize: isTabletOrUp ? 60 : 36,
            lineHeight: 1.12,
          }}
        >
          Oktoberfest
        </Box>
      </Typography>

      <Typography
        sx={{
          color: c.muted,
          fontSize: isTabletOrUp ? 20 : 16,
          lineHeight: 1.5,
          mt: 2,
          mb: isTabletOrUp ? 4 : 3,
          maxWidth: 380,
          width: '100%',
        }}
      >
        Search for a product, set your budget and compare vendors.
      </Typography>

      <Box sx={{ width: '100%', minWidth: 0 }}>
        <SearchBox onSubmit={onSearch} onPick={onPick} />
      </Box>

      <Typography
        sx={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: isTabletOrUp ? 15 : 12.5,
          letterSpacing: isTabletOrUp ? '.2em' : '.15em',
          color: '#4C607A',
          mt: isTabletOrUp ? 5 : 3.5,
          mb: 1.5,
        }}
      >
        BROWSE THE WIESN
      </Typography>

      {categories.error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          Couldn’t load categories. {categories.error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: isTabletOrUp ? 1.75 : 1.1,
          width: '100%',
          minWidth: 0,
        }}
      >
        {categories.loading &&
          [0, 1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              variant='rounded'
              height={isTabletOrUp ? 64 : 54}
              sx={{
                width: '100%',
                minWidth: 0,
                borderRadius: 4,
                gridColumn: i === 4 ? '1 / -1' : undefined,
              }}
            />
          ))}

        {list.map((cat, i) => (
          <ButtonBase
            key={cat.category_id}
            onClick={() => onCategory(cat.category_id)}
            sx={{
              width: '100%',
              minWidth: 0,
              overflow: 'hidden',
              gridColumn:
                list.length % 2 === 1 && i === list.length - 1
                  ? '1 / -1'
                  : undefined,
              display: 'flex',
              alignItems: 'center',
              gap: isTabletOrUp ? 2 : 1,
              px: isTabletOrUp ? 2.5 : 1.4,
              height: isTabletOrUp ? 64 : 54,
              borderRadius: 4,
              bgcolor: c.tile,
              color: '#fff',
              border: `1.5px solid ${c.gold}66`,
              justifyContent: 'flex-start',
              boxShadow: '0 4px 10px rgba(8,32,63,.18)',
              transition: 'transform .12s, border-color .12s',
              '&:hover': {
                borderColor: c.goldBright,
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Box
              sx={{
                color: c.goldBright,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              {categoryIcon(cat.category_id)}
            </Box>

            <Typography
              noWrap
              sx={{
                flex: 1,
                minWidth: 0,
                textAlign: 'left',
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: isTabletOrUp ? 22 : 15.5,
                letterSpacing: isTabletOrUp ? '.04em' : '.02em',
              }}
            >
              {categoryLabel(cat).toUpperCase()}
            </Typography>

            <ChevronRight
              sx={{
                color: c.goldBright,
                flexShrink: 0,
                fontSize: isTabletOrUp ? 24 : 20,
              }}
            />
          </ButtonBase>
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          mt: isTabletOrUp ? 5 : 3.5,
          px: 1,
          color: c.muted,
          minWidth: 0,
        }}
      >
        <SvgIcon
          viewBox='0 0 64 64'
          fill='none'
          sx={{ color: '#D4AF37', fill: 'none' }}
        >
          <path
            d='M20 50 C6 47 2 33 7 23 C12 12 26 9 33 18 C38 25 34 35 27 41 L18 49 M44 50 C58 47 62 33 57 23 C52 12 38 9 31 18 C26 25 30 35 37 41 L46 49'
            fill='none'
            stroke='currentColor'
            strokeWidth='6.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </SvgIcon>
        <Typography
          sx={{
            fontSize: isTabletOrUp ? '1rem' : '0.875rem',
            textAlign: 'center',
          }}
        >
          Sample prices in line with recent Wiesn ranges
        </Typography>
      </Box>
    </Box>
  );
}
