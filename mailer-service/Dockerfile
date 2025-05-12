FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN pip install poetry \
    && poetry config virtualenvs.create false

ARG RABBITMQ_URL

ENV RABBITMQ_URL=$RABBITMQ_URL

COPY pyproject.toml poetry.lock ./

RUN poetry install --no-interaction --no-ansi --no-root

COPY . .

CMD ["poetry", "run", "mailer"]