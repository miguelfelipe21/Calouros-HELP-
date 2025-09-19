import requests

headers = {
  'x-api-key': 'sec_oNSB8e6u0ii7J5jpRILoMFgGYMdIiksM',
  'Content-Type': 'application/json'
}
data = {'url': 'https://www.sistemahorus.com.br/edital-enem-2025.pdf'}
#data = {'url': 'https://download.inep.gov.br/enem/edital_52_de_23_de_maio_de_2025.pdf'}

response = requests.post(
    'https://api.chatpdf.com/v1/sources/add-url', headers=headers, json=data)

if response.status_code == 200:
    print('Source ID:', response.json()['sourceId'])
else:
    print('Status:', response.status_code)
    print('Error:', response.text)

    