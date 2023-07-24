import express from "express";
import cors, { CorsOptions } from "cors";
// Define custom CORS options using interface
interface CustomCorsOptions {
    origin?: string | string[];
    methods?: string | string[];
    credentials?: boolean;
  }
  // Function to configure and apply CORS middleware
  export const configureCors = ({ origin = '*', methods = 'GET,POST,PUT,DELETE', credentials = true }: CustomCorsOptions = {}): express.RequestHandler => {
    const corsOptions: CorsOptions = {
      origin,
      methods,
      credentials,
    };
  
    // Create and return the actual CORS middleware
    return cors(corsOptions);
  };
  

