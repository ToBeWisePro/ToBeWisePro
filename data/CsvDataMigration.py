import csv
import json
from re import I

def make_json():
    csvFilePath='/Users/gclark/Documents/GitHub/ToBeWise/src/data/quotes.csv'
    jsonFilePath = '/Users/gclark/Documents/GitHub/ToBeWise/src/data/jsonQuotes.json'
    data = {}
    i = 0
    with open(csvFilePath, encoding='utf-8') as csvf:
        csvReader = csv.DictReader(csvf)
        for rows in csvReader:
            key = i
            data[key] = rows
            i += 1
    with open(jsonFilePath, 'w', encoding='utf-8') as jsonf:
        jsonf.write(json.dumps(data, indent=4))


def make_array():
    csvFilePath='/Users/gclark/Documents/GitHub/ToBeWise/src/data/quotes.csv'
    jsonFilePath = '/Users/gclark/Documents/GitHub/ToBeWise/src/data/jsonQuotes.json'
    data = {}
    i = 0
    with open(jsonFilePath, 'w', encoding='utf-8') as jsonf:
        jsonf.write("[")
        with open(csvFilePath, encoding='utf-8') as csvf:
            csvReader = csv.DictReader(csvf)
            for rows in csvReader:
                jsonf.write(json.dumps(rows, indent=4))
                jsonf.write(",")
        jsonf.write("]")

make_array()
