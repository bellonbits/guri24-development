#!/bin/bash
export PATH="/Users/mac/.nvm/versions/node/v24.14.1/bin:$PATH"
npm run build && npx cap sync ios
