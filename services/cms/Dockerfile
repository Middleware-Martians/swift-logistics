FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml poetry.lock* /app/
RUN pip install --upgrade pip
RUN pip install fastapi uvicorn[standard] sqlalchemy[asyncio] asyncpg pydantic aiokafka python-multipart passlib[bcrypt] python-jose
COPY . /app
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
