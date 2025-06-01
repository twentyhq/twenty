#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}==>${NC} $1"
}

# Function to print error messages
print_error() {
    echo -e "${RED}Error:${NC} $1"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}Warning:${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Check if we have uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Add twentyhq as upstream if it doesn't exist
if ! git remote | grep -q "upstream"; then
    print_status "Adding twentyhq as upstream remote..."
    git remote add upstream https://github.com/twentyhq/twenty.git
fi

# Fetch latest changes from upstream
print_status "Fetching latest changes from upstream..."
git fetch upstream main

# Get current branch
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

# If we're not on main, ask if we want to switch
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "You're not on the main branch. Current branch: $CURRENT_BRANCH"
    read -p "Do you want to switch to main branch? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
    else
        print_error "Please switch to main branch manually and run the script again"
        exit 1
    fi
fi

# Rebase main on top of upstream
print_status "Rebasing main on top of upstream..."
if ! git rebase upstream/main; then
    print_error "Rebase failed. Please resolve conflicts manually and then run:"
    echo "git rebase --continue"
    exit 1
fi

# Push changes to origin
print_status "Pushing changes to origin..."
if ! git push --force-with-lease origin main; then
    print_error "Failed to push changes to origin"
    exit 1
fi

print_status "Update completed successfully!"
print_status "Your main branch is now up to date with twentyhq/twenty's main branch"

# Show current status
echo
print_status "Current repository status:"
git status 