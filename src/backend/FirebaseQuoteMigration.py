import csv
import firebase_admin
from firebase_admin import firestore
from auth import initialize_firestore

# Initialize Firestore
firebase_app = initialize_firestore()
db = firestore.client(app=firebase_app)
quotes_collection = db.collection('quotes')

# Read CSV and upload to Firestore
with open('../../data/quotes.csv', 'r', encoding='utf-8', errors='replace') as file:
    reader = csv.DictReader(file)
    
    for row in reader:
        try:
            quote_data = {
                'contributedBy': row['ContributedBy'],
                'author': row['Author'],
                'subjects': row['Subjects'].split(', '),
                'authorLink': row['AuthorLink'],
                'videoLink': row['VideoLink'],
                'quoteText': row['Quotation']
            }
            
            # Add data to Firestore
            quotes_collection.add(quote_data)
        except Exception as e:
            print(f"Error processing row {row}: {e}")

print("Migration complete!")
