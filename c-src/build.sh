#!/bin/bash

# Check if cmake is available in PATH
if ! command -v cmake &> /dev/null; then
    echo "Error: cmake is not found in PATH"
    echo "Please ensure cmake is installed and added to your PATH"
    exit 1
fi

# Create build directory if it doesn't exist
if [ ! -d "build" ]; then
    mkdir build
    cd build
    cmake ../
    cd ..
fi

cmake --build build

# Copy executables to /bin
echo "Copying executables to /bin..."
mkdir -p ../bin
cp -f build/bin/Debug/*.exe ../bin/
