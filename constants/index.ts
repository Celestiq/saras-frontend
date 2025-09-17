// API and Environment Constants
import 'dotenv/config';

export const API_PREFIX = process.env.NODE_ENV === 'production'
    ? "https://api.mysaras.club"
    : "http://localhost:8080";

// Pricing Constants
export const PRICE_SUBSCRIPTION = 2.00;
export const PRICE_ONE_TIME = 3.00;

// Add any other values that are used in multiple places
export const APP_NAME = "Saras";