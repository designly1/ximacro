#!/bin/bash

# Remove build directory and call build.sh
rm -rf build
"$(dirname "$0")/build.sh" 