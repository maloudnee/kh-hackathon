from google.adk.agents.llm_agent import Agent
from agents.level1_agent import level1_agent
from agents.level2_agent import level2_agent
from agents.finalboss_agent import finalboss_agent

root_agent = Agent(
    model='gemini-2.5-flash',
    name='root_agent',
    description='You are a game orchestrator. As game orchestrator you manage and coordinate communication between all other agents. ',
    instruction=(
        "Recieve messages from game engine. "
        "Decide which level agent to engage based on current level. "
        "Once response is retrieved from agent, forward key information to subsequent levels and final boss afent. "
        "Ensure data integrity and maintain game progression logic. "
    )
)

#Registry of levels/agents
agents = {
    1: level1_agent,
    2: level2_agent,
    3: finalboss_agent
}

def handle_game_tick(game_data):
    player_stats = game_data["player_stats"]
    current_level = game_data["level"]

    agent = agents.get(current_level)

    if not agent:
        return {
            "error": "invalid level"
        }
    
    response = agent.send_message(root_agent, player_stats)

    return {
        "level": current_level,
        "enemy_actions": response.get("enemy_actions", []),
        "timestamp": game_data.get("timestamp")
    }