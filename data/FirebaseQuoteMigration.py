import csv
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firestore
cred = credentials.Certificate('firebaseAdminSDK.json')
firebase_admin.initialize_app(cred)
db = firestore.client()
quotes_collection = db.collection('quotes')

# Read CSV and upload to Firestore
with open('quotes.csv', 'r', encoding='utf-8', errors='replace') as file:
    reader = csv.DictReader(file)
    
    for row in reader:
        try:
            quote_data = {
                'contributedBy': row['ContributedBy'],
                'author': row['Author'],
                'subjects': row['Subjects'].split(', '),
                'authorLink': row['AuthorLink'],
                'videoLink': row['VideoLink'],
                'quotation': row['Quotation']
            }
            
            # Add data to Firestore
            quotes_collection.add(quote_data)
        except Exception as e:
            print(f"Error processing row {row}: {e}")

print("Migration complete!")
