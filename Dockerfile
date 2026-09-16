FROM python:3.12-slim

WORKDIR /app

COPY requirements/ ./requirements/

RUN pip install --no-cache-dir -r requirements/prod.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "src.main:ObserverTasker", "--host", "0.0.0.0", "--port", "8000"]