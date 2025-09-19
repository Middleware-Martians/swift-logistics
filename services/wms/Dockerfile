FROM python:3.11-slim

WORKDIR /app

# Install system deps needed for some python packages
RUN apt-get update && apt-get install -y build-essential gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements-wms.txt /app/
RUN python -m pip install --upgrade pip
RUN pip install -r requirements-wms.txt

COPY . /app

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
