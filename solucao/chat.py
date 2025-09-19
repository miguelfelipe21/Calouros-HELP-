import requests

headers = {
    'x-api-key': 'sec_oNSB8e6u0ii7J5jpRILoMFgGYMdIiksM',
    "Content-Type": "application/json",
}

data = {
    'sourceId': "src_QfPWzMsoCQigRNepgI7iQ",
    'messages': [
        {
            'role': "user",
            'content': "que dia será a prova?",
        }
    ]
}

response = requests.post(
    'https://api.chatpdf.com/v1/chats/message', headers=headers, json=data)

if response.status_code == 200:
    print('Result:', response.json()['content'])
else:
    print('Status:', response.status_code)
    print('Error:', response.text)