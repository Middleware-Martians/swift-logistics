FROM python:3.11-slim

WORKDIR /app
RUN apt-get update && apt-get install -y build-essential gcc && rm -rf /var/lib/apt/lists/*

COPY requirements-tcp.txt /app/
RUN python -m pip install --upgrade pip
RUN pip install -r requirements-tcp.txt

COPY . /app

EXPOSE 9000

CMD ["python", "adapter.py"]
