#!/usr/bin/env python
"""
Development helper script for Accommodation Portal
"""

import os
import sys
import subprocess

def run_command(command, description):
    """Run a command and print its description."""
    print(f"\n🔄 {description}...")
    result = subprocess.run(command, shell=True)
    if result.returncode == 0:
        print(f"✅ {description} completed successfully!")
    else:
        print(f"❌ {description} failed!")
        sys.exit(1)

def main():
    """Main function to handle different development tasks."""
    if len(sys.argv) < 2:
        print("Usage: python dev.py <command>")
        print("Commands:")
        print("  setup     - Initial project setup")
        print("  migrate   - Run database migrations")
        print("  test      - Run tests")
        print("  run       - Start development server")
        print("  check     - Check Django configuration")
        print("  shell     - Start Django shell")
        sys.exit(1)
    
    command = sys.argv[1]
    python_exe = r".\.venv\Scripts\python.exe" if os.name == 'nt' else ".venv/bin/python"
    
    if command == "setup":
        run_command(f"{python_exe} manage.py migrate", "Running initial migrations")
        run_command(f"{python_exe} manage.py collectstatic --noinput", "Collecting static files")
        print("\n🎉 Setup completed! You can now run: python dev.py run")
        
    elif command == "migrate":
        run_command(f"{python_exe} manage.py makemigrations", "Creating migrations")
        run_command(f"{python_exe} manage.py migrate", "Applying migrations")
        
    elif command == "test":
        run_command(f"{python_exe} manage.py test", "Running tests")
        
    elif command == "run":
        run_command(f"{python_exe} manage.py runserver", "Starting development server")
        
    elif command == "check":
        run_command(f"{python_exe} manage.py check", "Checking Django configuration")
        
    elif command == "shell":
        run_command(f"{python_exe} manage.py shell", "Starting Django shell")
        
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()
