import serial
import requests
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from twilio.rest import Client

COM_PORT = "COM3"
BAUD_RATE = 9600
THINGSPEAK_API_KEY = 'YOUR_THINGSPEAK_API_KEY'
THINGSPEAK_URL = "https://api.thingspeak.com/update"

SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SENDER_EMAIL = 'your_email@gmail.com'
SENDER_PASSWORD = 'your_email_password'
RECIPIENT_EMAIL = 'recipient_email@gmail.com'

TWILIO_ACCOUNT_SID = 'YOUR_TWILIO_ACCOUNT_SID'
TWILIO_AUTH_TOKEN = 'YOUR_TWILIO_AUTH_TOKEN'
TWILIO_PHONE_NUMBER = 'YOUR_TWILIO_PHONE_NUMBER'
RECIPIENT_PHONE_NUMBER = 'recipient_phone_number'

MQ9_THRESHOLD = 30
MQ135_THRESHOLD = 300
MQ2_THRESHOLD = 300

last_alert_time = {
    "MQ9": datetime.min,
    "MQ135": datetime.min,
    "MQ2": datetime.min
}

TIME_GAP = timedelta(minutes=30)

def send_email_alert(sensor_name, value):
    try:
        message = MIMEMultipart()
        message['From'] = SENDER_EMAIL
        message['To'] = RECIPIENT_EMAIL
        message['Subject'] = f"Alert: {sensor_name} Value Exceeded Threshold"
        
        body = f"The {sensor_name} sensor value has exceeded the threshold.\n\nCurrent Value: {value}"
        message.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)

        text = message.as_string()
        server.sendmail(SENDER_EMAIL, RECIPIENT_EMAIL, text)
        server.quit()
        print(f"Email alert sent for {sensor_name}!")
    except Exception as e:
        print(f"Error sending email: {e}")

def send_sms_alert(sensor_name, value):
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"ALERT: {sensor_name} value has exceeded threshold. Current value: {value}",
            from_=TWILIO_PHONE_NUMBER,
            to=RECIPIENT_PHONE_NUMBER
        )
        print(f"SMS alert sent for {sensor_name}!")
    except Exception as e:
        print(f"Error sending SMS: {e}")

def process_and_send(data):
    try:
        mq9_ppm, mq135_ppm, mq2_ppm, temperature, humidity = data.split(",")

        current_time = datetime.now()

        if float(mq9_ppm) > MQ9_THRESHOLD:
            if current_time - last_alert_time["MQ9"] >= TIME_GAP:
                send_email_alert("MQ9", mq9_ppm)
                send_sms_alert("MQ9", mq9_ppm)
                last_alert_time["MQ9"] = current_time

        if float(mq135_ppm) > MQ135_THRESHOLD:
            if current_time - last_alert_time["MQ135"] >= TIME_GAP:
                send_email_alert("MQ135", mq135_ppm)
                send_sms_alert("MQ135", mq135_ppm)
                last_alert_time["MQ135"] = current_time

        if float(mq2_ppm) > MQ2_THRESHOLD:
            if current_time - last_alert_time["MQ2"] >= TIME_GAP:
                send_email_alert("MQ2", mq2_ppm)
                send_sms_alert("MQ2", mq2_ppm)
                last_alert_time["MQ2"] = current_time

        payload = {
            "api_key": THINGSPEAK_API_KEY,
            "field1": mq9_ppm,
            "field2": mq135_ppm,
            "field3": mq2_ppm,
            "field4": temperature,
            "field5": humidity,
        }

        response = requests.post(THINGSPEAK_URL, data=payload)
        if response.status_code == 200:
            print(f"Data sent successfully: {payload}")
        else:
            print(f"Failed to send data: {response.text}")

    except ValueError as e:
        print(f"Error processing data: {data} - {e}")

def read_serial_data():
    try:
        ser = serial.Serial(COM_PORT, BAUD_RATE, timeout=1)
        print(f"Connected to {COM_PORT} at {BAUD_RATE} baud.")
        while True:
            raw_data = ser.readline().decode('utf-8').strip()
            if raw_data:
                print(f"Received: {raw_data}")
                process_and_send(raw_data)
            time.sleep(2)
    except serial.SerialException as e:
        print(f"Serial connection error: {e}")
    except KeyboardInterrupt:
        print("Exiting script.")
    finally:
        ser.close()

if __name__ == "__main__":
    print("Starting ThingSpeak uploader...")
    read_serial_data()