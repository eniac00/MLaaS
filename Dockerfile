# Use the official Ubuntu base image
FROM ubuntu:latest

# Install Python 3 and pip3
RUN apt-get update && \
    apt-get install -y python3 python3-pip

# Install pycaret using pip3
RUN pip3 install joblib==1.3.2 pycaret

# Create a directory for your app
WORKDIR /app

# Copy the contents of the heart/ folder to /app/
COPY heart/ /app/
