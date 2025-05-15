#!/bin/bash

# Create certs directory if it doesn't exist
mkdir -p src/certs

# Generate private key and certificate
openssl req -x509 -newkey rsa:2048 -keyout src/certs/key.pem -out src/certs/cert.pem -days 365 -nodes -subj "/CN=localhost"

echo "Self-signed certificates generated successfully!"
echo "Key: src/certs/key.pem"
echo "Cert: src/certs/cert.pem" 