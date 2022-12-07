import json 
import requests

path = "./audio/emchaoanh.mp3"

url = "http://localhost:2726/changer"
url_get = "http://localhost:2726/"

file = {"audio_file": open(path,"rb")}
json = {
      "name": "alienRobot",
      "title": "Alien Robot",
      "description": "This sounds like a sort of robotic alien insect thing - or some sort of alien robot, anyway. You can play around with the parameters to create some other strange effects too. Make sure to try <u>lowering the frequency</u> for some fun effects! Note that the \"magnitude\" parameter controls the <i>overall</i> amount that this effect is applied.",
      "params": [
        {"name":"magnitude", "title":"Magnitude", "type":"range", "min":0, "max":1, "step":0.01, "value":1},
      ]
    }
response = requests.post(url,files=file, data=json, verify=False)
# response = requests.get(url_get,verify=False)

print(response.text)