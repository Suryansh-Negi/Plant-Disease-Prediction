import requests

url = 'http://127.0.0.1:5000/predict'
image_path = 'test_leaf.jpg'  # Replace this

with open(image_path, 'rb') as img:
    files = {'file': img}
    response = requests.post(url, files=files)

print(response.json())
