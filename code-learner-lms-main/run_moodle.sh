#!/bin/bash

# Configuration
MOODLE_ROOT="/Users/sruthi/moodle"
MYSQL_DATA="/tmp/moodle-mysql-data"
MYSQL_SOCKET="/tmp/moodle-mips.sock"
PHP_INI="/tmp/moodle-php.ini"

echo "--- Starting Moodle Local Environment ---"

# 1. Start MySQL if not running
if [ ! -S "$MYSQL_SOCKET" ]; then
    echo "Starting MySQL..."
    mysqld --datadir="$MYSQL_DATA" --socket="$MYSQL_SOCKET" >/tmp/moodle-mysql.log 2>&1 &
    sleep 5
else
    echo "MySQL is already running."
fi

# 2. Start PHP server if not running
if ! pgrep -f "php -S localhost:8080" > /dev/null; then
    echo "Starting PHP Server on http://localhost:8080..."
    php -S localhost:8080 -t "$MOODLE_ROOT/public" -c "$PHP_INI" >/tmp/moodle-php.log 2>&1 &
    sleep 2
else
    echo "PHP Server is already running on http://localhost:8080."
fi

echo "--- Moodle is READY ---"
echo "URL: http://localhost:8080"
echo "Admin Login: admin / Admin123!"
echo "---"
echo "To stop Moodle, run: killall php mysqld"
