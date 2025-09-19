FROM python:3.11-slim

WORKDIR /app
RUN apt-get update && apt-get install -y build-essential gcc && rm -rf /var/lib/apt/lists/*

COPY requirements-notif.txt /app/
RUN python -m pip install --upgrade pip
RUN pip install -r requirements-notif.txt

COPY . /app

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
