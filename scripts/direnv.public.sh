#!/bin/bash

# How to add this to your project:
# echo "source scripts/direnv.public.sh" >> .envrc

set -euo pipefail

if [ -d "$PWD/scripts" ]; then export PATH="$PWD/scripts:$PATH";fi
chmod +x $PWD/scripts/cristina

export PROJECT_ROOT=$PWD
