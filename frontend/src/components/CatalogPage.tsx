import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
} from '@mui/material';
import { productAPI, categoryAPI, attributeAPI } from '../services/api';
import type { Product, Category, Attribute } from '../types/index';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [productsData, categoriesData, attributesData] =
          await Promise.all([
            productAPI.getProducts(),
            categoryAPI.getCategories(),
            attributeAPI.getAttributes(),
          ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setAttributes(attributesData);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <Box
        component='div'
        sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color='error' sx={{ mt: 5 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      {/* Products */}
      <Typography variant='h5' gutterBottom>
        Products
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Variant</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Traditional</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.product_name}</TableCell>
                <TableCell>{p.variant}</TableCell>
                <TableCell>{p.unit}</TableCell>
                <TableCell>{p.is_traditional ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Categories */}
      <Typography variant='h5' gutterBottom>
        Categories
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.category_name}</TableCell>
                <TableCell>{c.description ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Attributes */}
      <Typography variant='h5' gutterBottom>
        Attributes
      </Typography>
      <TableContainer component={Paper}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attributes.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.attribute_name}</TableCell>
                <TableCell>{a.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
