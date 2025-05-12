import pika
import json

def send_test_message():
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost', 5672))
    channel = connection.channel()

    channel.queue_declare(queue='email_queue', durable=True)

    message = {
        "recipient": "gabriel.titeux@supinfo.com",
        "subject": "Test Email",
        "body": "This is a test email sent using the mailer-service."
    }

    channel.basic_publish(
        exchange='',
        routing_key='email_queue',
        body=json.dumps(message),
        properties=pika.BasicProperties(
            delivery_mode=2,
        ))
    print(" [x] Sent test email message")
    connection.close()

if __name__ == "__main__":
    send_test_message()
