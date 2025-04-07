#!/bin/bash

# Start the backend server
echo "Starting backend server..."
cd server
npm start &

# Start the frontend client
echo "Starting frontend client..."
cd ../client
npm start 