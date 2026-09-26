import axios, { type AxiosInstance, AxiosError } from 'axios';
import type { Product, Category, Attribute } from '../types';

const API_BASE_URL = 'https://hermes-3skk.onrender.com/';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = error.response?.data ?? error.message;
    console.error(`APi error [${error.config?.url}]:`, message);
    return Promise.reject(error);
  }
);

//get aLL products

export const productAPI = {
  getProducts: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>('/products');
    return data;
  },

};

export const categoryAPI = {
  getCategories: async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

};

export const attributeAPI = {
  getAttributes: async (): Promise<Attribute[]> => {
    const { data } = await api.get<Attribute[]>('/attributes');
    return data;
  },

};
