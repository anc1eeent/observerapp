FROM python:3.12-slim

WORKDIR /app

COPY requirements/ ./requirements/

RUN pip install --no-cache-dir -r requirements/prod.txt

COPY . .

EXPOSE 8000

# Запускаємо сервер (зверни увагу на шлях src.main:app)
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]