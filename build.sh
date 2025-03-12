#!/bin/zsh
set -eo pipefail

# Clean everything
rm -rf ios/{build,Pods,Podfile.lock,ToBeWisePro.xcworkspace} node_modules yarn.lock package-lock.json
find ~/Library/Developer/Xcode/DerivedData -mindepth 1 -delete 2>/dev/null || true

# Install Node modules
echo "📦 Installing Node modules..."
yarn install --force --network-timeout 1000000

# Setup Ruby environment
echo "💎 Configuring Ruby..."
export GEM_HOME="$HOME/.gem"
export PATH="$GEM_HOME/bin:$PATH"
mkdir -p $GEM_HOME

# Install CocoaPods
echo "🍫 Installing CocoaPods..."
gem install cocoapods -v 1.15.2 --user-install 2>/dev/null

# Regenerate native files
echo "🛠️  Regenerating native modules..."
npx expo prebuild --clean

# Install pods with clean installation
echo "🚀 Installing Pods..."
cd ios
pod deintegrate
pod cache clean --all
pod install --repo-update --clean-install
cd ..

# Build project
echo "🏗️  Building project..."
RCT_NEW_ARCH_ENABLED=0 \
NODE_OPTIONS=--openssl-legacy-provider \
npx expo run:ios --no-install 