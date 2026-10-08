import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(
    api_key=os.environ["LLM_API_KEY"],
    base_url=os.environ["LLM_BASE_URL"],
)

resp = client.chat.completions.create(
    model=os.environ["LLM_MODEL"],
    messages=[{
        "role": "user",
        "content": "Write 2 multiple-choice questions on Python. Return ONLY JSON: "
                   '[{"question": "...", "options": ["a","b","c","d"], "answer_index": 0}]'
    }],
)
print(resp.choices[0].message.content)