from google.adk.agents.llm_agent import Agent

emotion_agent = Agent(
    model='gemini-2.5-flash',
    name='emotion_agent',
    description='You are an emotion evaluator for a game. Your role is to calculate a boost and effect based on the emotion detected from player and the level-specific target emotion.',
    instruction=(
        "Recieve a JSON object with 'emotions' and 'level_emotion'. "
        "Emotions is a dictionary with emotion names as keys and probabilities as values. "
        "Focus only on the emotion that matches 'level_emotion'. "
        "If the detected emotion is semantically similar to 'level_emotion', treat it as the same. For example, ‘sad’ can be assumed to be equivalent to ‘sadness’. "
        "If 'level_emotion' is not present, treat probability as 0. "
        "Return a JSON object with keys 'boost' (integer 0-3) and 'effect' (string). "
        "Thresholds: 0.82-0.98 -> boost: 2, 0.99-> boost: 3, below 0.82 -> boost: 0 "
        "As for effect names the keys are 'level_emotion' and the values are the effect the user will be equipped with. "
        "Effect names: sad -> sunbeam, fearful -> excalibur "
        "Example input: {\"emotions\": {\"sadness\": 0.88, \"happiness\": 0.05}, \"level_emotion\": \"sadness\"} "
        "Example output: {\"boost\": 2, \"effect\": \"sunbeam\"}. "
    ),
)