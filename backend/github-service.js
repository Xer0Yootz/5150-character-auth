import axios from 'axios';

const ABILITY_UNLOCKS = {
  'machine-learning': 'Neural Pattern Recognition',
  encryption: 'Cryptographic Mastery',
  blockchain: 'Distributed Ledger Sense',
  api: 'Protocol Fluency',
  database: 'Data Architecture',
  frontend: 'Interface Crafting',
  backend: 'System Orchestration',
  devops: 'Infrastructure Control',
  security: 'Threat Anticipation',
  ai: 'Artificial Cognition',
  cli: 'Command Line Dominion',
  network: 'Signal Mastery'
};

export async function searchRepos(query, token) {
  try {
    const response = await axios.get(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=6`,
      {
        headers: {
          'User-Agent': '5150-Auth',
          Authorization: token ? `token ${token}` : undefined
        }
      }
    );

    return (response.data.items || []).map((item) => ({
      id: item.id,
      name: item.full_name,
      url: item.html_url,
      owner: item.owner?.login || 'unknown',
      description: item.description,
      stars: item.stargazers_count,
      language: item.language
    }));
  } catch (error) {
    console.error('GitHub search failed:', error.message);
    return [];
  }
}

export function getAbilityUnlock(repoName, language) {
  const lower = String(repoName).toLowerCase();

  for (const [keyword, ability] of Object.entries(ABILITY_UNLOCKS)) {
    if (lower.includes(keyword)) return ability;
  }

  if (language === 'Python') return 'Data Processing Mastery';
  if (language === 'JavaScript') return 'Async Pattern Fluency';
  if (language === 'Rust') return 'Memory Precision';
  if (language === 'Go') return 'Concurrency Mastery';

  return 'Technical Proficiency';
}

export default { searchRepos, getAbilityUnlock };
