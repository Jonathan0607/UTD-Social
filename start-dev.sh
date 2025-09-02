#!/bin/bash

echo "🚀 Starting UTD Social Development Environment..."

# Function to check if MongoDB is running
check_mongodb() {
    if pgrep -x "mongod" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to start MongoDB if not running
start_mongodb() {
    echo "📊 Checking MongoDB status..."
    if check_mongodb; then
        echo "✅ MongoDB is already running"
    else
        echo "🔄 Starting MongoDB..."
        brew services start mongodb/brew/mongodb-community
        sleep 3
        
        # Wait for MongoDB to be ready
        echo "⏳ Waiting for MongoDB to be ready..."
        for i in {1..30}; do
            if check_mongodb; then
                echo "✅ MongoDB is now running"
                break
            fi
            echo "⏳ Still waiting... ($i/30)"
            sleep 1
        done
        
        if ! check_mongodb; then
            echo "❌ Failed to start MongoDB. Please check manually:"
            echo "   brew services start mongodb/brew/mongodb-community"
            exit 1
        fi
    fi
}

# Function to start the development environment
start_dev() {
    echo "🔧 Starting development environment..."
    echo "📱 Frontend: React Native Expo app"
    echo "🔧 Backend: Node.js API server"
    echo "📊 Database: MongoDB"
    echo ""
    echo "🌐 Backend API will be available at: http://localhost:3001"
    echo "📱 Frontend will be available through Expo"
    echo ""
    echo "Press Ctrl+C to stop all services"
    echo ""
    
    # Start both services using npm run dev
    npm run dev
}

# Main execution
echo "🔍 Checking system requirements..."

# Check if Homebrew is available
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Please install Homebrew first:"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB not found. Installing MongoDB..."
    brew tap mongodb/brew
    brew install mongodb-community
fi

# Start MongoDB
start_mongodb

# Start development environment
start_dev 