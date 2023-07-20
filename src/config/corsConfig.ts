import express from "express";
import cors, { CorsOptions } from "cors";
// Define custom CORS options using interface
interface CustomCorsOptions {
    origin?: string | string[];
    methods?: string | string[];
    credentials?: boolean;
  }
  
  // Function to configure and apply CORS middleware
 export  const configureCors = (options?: CustomCorsOptions): express.RequestHandler => {
    // Default values for CORS options
    const defaultOrigin = '*';
    const defaultMethods = 'GET,POST,PUT,DELETE';
    const defaultCredentials = true;
  
    // Prepare CORS options based on custom values or defaults
    const corsOptions: CorsOptions = {
      origin: options?.origin || defaultOrigin,
      methods: options?.methods || defaultMethods,
      credentials: options?.credentials === undefined ? defaultCredentials : options.credentials,
    };
  
    // Create and return the actual CORS middleware
    return cors(corsOptions);
  };
  

