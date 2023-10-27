import json
from firebase_admin import credentials, initialize_app

def initialize_firestore():
    # Load credentials from JSON file
    with open('tobewise-187b9-firebase-adminsdk-97tdq-05f1305224.json', 'r') as file:
        cred_data = json.load(file)

    # Use the values from the JSON file to create a credentials object
    cred = credentials.Certificate(cred_data)
    firebase_app = initialize_app(cred)
    return firebase_app
