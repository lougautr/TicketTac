# mailer.py

import asyncio
import aio_pika
import os
import json
from dotenv import load_dotenv
from email.message import EmailMessage
import aiosmtplib
import logging
from aio_pika import ExchangeType, exceptions
import signal

load_dotenv()

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger("MailerService")

# RabbitMQ configurations
RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq/')
QUEUE_NAME = os.getenv('RABBITMQ_QUEUE', 'email_queue')

# SMTP configurations
SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USER = os.getenv('SMTP_USER') 
SMTP_PASS = os.getenv('SMTP_PASS') 
FROM_EMAIL = os.getenv('FROM_EMAIL')

# Reconnection configurations
RECONNECT_DELAY_INITIAL = int(os.getenv('RECONNECT_DELAY_INITIAL', 5))
RECONNECT_DELAY_MAX = int(os.getenv('RECONNECT_DELAY_MAX', 60))

# Debugging: Log loaded configurations (excluding sensitive information)
logger.debug(f"RABBITMQ_URL: {RABBITMQ_URL}")
logger.debug(f"QUEUE_NAME: {QUEUE_NAME}")
logger.debug(f"SMTP_HOST: {SMTP_HOST}")
logger.debug(f"SMTP_PORT: {SMTP_PORT}")
logger.debug(f"SMTP_USER: {SMTP_USER}")
logger.debug(f"FROM_EMAIL: {FROM_EMAIL}")

async def send_email(recipient: str, subject: str, body: str):
    """
    Sends an email using the specified SMTP server.
    """
    message = EmailMessage()
    message["From"] = FROM_EMAIL
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(body)

    try:
        response = await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASS,
            start_tls=True,
        )
        logger.info(f"Email sent to {recipient}")
    except aiosmtplib.SMTPException as smtp_err:
        logger.error(f"SMTP error occurred while sending email to {recipient}: {smtp_err}")
    except Exception as e:
        logger.error(f"Failed to send email to {recipient}: {e}")

async def consume(stop_event):
    """
    Connects to RabbitMQ and consumes messages from the specified queue.
    Implements a reconnection strategy with exponential backoff.
    """
    reconnect_delay = RECONNECT_DELAY_INITIAL

    while not stop_event.is_set():
        try:
            logger.info(f"Attempting to connect to RabbitMQ at {RABBITMQ_URL}")
            connection = await aio_pika.connect_robust(RABBITMQ_URL)
            channel = await connection.channel()
            await channel.set_qos(prefetch_count=10)

            # Declare the queue
            queue = await channel.declare_queue(QUEUE_NAME, durable=True)

            logger.info(f"[*] Waiting for messages in '{QUEUE_NAME}'. To exit press CTRL+C")

            # Reset reconnect_delay after successful connection
            reconnect_delay = RECONNECT_DELAY_INITIAL

            async with queue.iterator() as queue_iter:
                async for message in queue_iter:
                    if stop_event.is_set():
                        break
                    async with message.process():
                        try:
                            body = message.body.decode()
                            data = json.loads(body)  # Safely parse JSON

                            recipient = data.get("recipient")
                            subject = data.get("subject")
                            body_content = data.get("body")

                            if recipient and subject and body_content:
                                await send_email(recipient, subject, body_content)
                            else:
                                logger.warning("Invalid message format: Missing fields")
                        except json.JSONDecodeError:
                            logger.error("Failed to decode JSON message")
                        except Exception as e:
                            logger.error(f"Error processing message: {e}")

        except (aio_pika.exceptions.AMQPConnectionError, ConnectionRefusedError) as e:
            if stop_event.is_set():
                break
            logger.error(f"Connection error: {e}")
            logger.info(f"Reconnecting in {reconnect_delay} seconds...")
            await asyncio.sleep(reconnect_delay)
            reconnect_delay = min(reconnect_delay * 2, RECONNECT_DELAY_MAX)
        except Exception as e:
            if stop_event.is_set():
                break
            logger.error(f"Unexpected error: {e}")
            logger.info(f"Reconnecting in {reconnect_delay} seconds...")
            await asyncio.sleep(reconnect_delay)
            reconnect_delay = min(reconnect_delay * 2, RECONNECT_DELAY_MAX)

def main():
    """
    Entry point for the mailer service.
    """
    stop_event = asyncio.Event()

    def shutdown_handler():
        logger.info("Shutdown signal received. Stopping mailer service...")
        stop_event.set()

    # Register signal handlers for graceful shutdown
    loop = asyncio.get_event_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, shutdown_handler)

    try:
        asyncio.run(consume(stop_event))
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
    finally:
        logger.info("Mailer service has been stopped.")

if __name__ == "__main__":
    main()