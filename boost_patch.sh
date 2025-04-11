#!/bin/bash

# Function to print an error message and exit
error_exit() {
  echo "Error: $1"
  exit 1
}

# Locate the boost.podspec file
BOOST_PODSPEC_PATH="$(find ./node_modules -path "*/third-party-podspecs/boost.podspec" 2>/dev/null)"

if [ -z "$BOOST_PODSPEC_PATH" ]; then
  error_exit "boost.podspec file not found. Ensure dependencies are installed and try again."
fi

# Backup the original podspec file
BACKUP_PATH="${BOOST_PODSPEC_PATH}.bak"
if [ ! -f "$BACKUP_PATH" ]; then
  cp "$BOOST_PODSPEC_PATH" "$BACKUP_PATH" || error_exit "Failed to create a backup of boost.podspec."
  echo "Backup created at $BACKUP_PATH"
else
  echo "Backup already exists at $BACKUP_PATH"
fi

# Modify the podspec file
sed -i '' \
  's|:http => .*|:http => "https://sourceforge.net/projects/boost/files/boost/1.76.0/boost_1_76_0.tar.bz2",|' \
  "$BOOST_PODSPEC_PATH" || error_exit "Failed to update boost.podspec source URL."

# Add the correct sha256 hash
if ! grep -q ":sha256 =>" "$BOOST_PODSPEC_PATH"; then
  sed -i '' \
    '/:http =>/a\
    :sha256 => "f0397ba6e982c4450f27bf32a2a83292aba035b827a5623a14636ea583318c41",' \
    "$BOOST_PODSPEC_PATH" || error_exit "Failed to add sha256 to boost.podspec."
else
  sed -i '' \
    's|:sha256 => .*|:sha256 => "f0397ba6e982c4450f27bf32a2a83292aba035b827a5623a14636ea583318c41",|' \
    "$BOOST_PODSPEC_PATH" || error_exit "Failed to update sha256 in boost.podspec."
fi

# Validate the changes
echo "Updated boost.podspec:"
cat "$BOOST_PODSPEC_PATH" | grep -E ':http|:sha256'

# Success message
echo "boost.podspec file has been updated successfully."
echo "You can now run 'pod install --repo-update' to proceed."
