FROM public.ecr.aws/docker/library/python:3.11-slim
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir fastapi uvicorn requests pydantic

# Copy the code
COPY . .

EXPOSE 8000

# Run the app
CMD ["python", "main.py"]