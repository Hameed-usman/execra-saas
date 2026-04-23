from app.utils import clean_llm_json

test_cases = [
    {
        "name": "Simple JSON",
        "input": '{"a": 1}',
        "expected": '{"a": 1}'
    },
    {
        "name": "JSON with trailing text",
        "input": '{"a": 1} is your result.',
        "expected": '{"a": 1}'
    },
    {
        "name": "Multiple JSON blocks",
        "input": 'Some text {"a": 1} and {"b": 2} more text.',
        "expected": '{"a": 1}'
    },
    {
        "name": "Nested JSON",
        "input": 'Result: {"a": {"b": [1, 2, 3]}, "c": "d"} trailing.',
        "expected": '{"a": {"b": [1, 2, 3]}, "c": "d"}'
    },
    {
        "name": "Markdown block",
        "input": '```json\n{"a": 1}\n```',
        "expected": '{"a": 1}'
    }
]

for case in test_cases:
    result = clean_llm_json(case["input"])
    print(f"Test: {case['name']}")
    print(f"Result: {result}")
    assert result == case["expected"]
    print("PASSED")
    print("-" * 20)

print("ALL TESTS PASSED!")
