FROM python:3.12-slim

# Usuario sin privilegios
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Dependencias Python (sin libpq/gcc: MVP usa asyncpg con wheels precompilados)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser . .

USER appuser
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
