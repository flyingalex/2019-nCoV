import json
import requests
import re
import os

def load_dxy_data():
  url = 'https://3g.dxy.cn/newh5/view/pneumonia'
  raw_html = requests.get(url).content.decode('utf8')
  match = re.search('window.getAreaStat = (.*?)}catch', raw_html)
  raw_json = match.group(1)
  result = json.loads(raw_json, encoding='utf8')
  return result

script_dir = os.path.dirname(__file__)
rel_path = "src/data/result.json"
abs_file_path = os.path.join(script_dir, rel_path)
with open(abs_file_path, 'w', encoding='utf-8') as outfile:
    json.dump(load_dxy_data(), outfile, ensure_ascii=False)