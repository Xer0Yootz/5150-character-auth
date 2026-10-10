import axios from 'axios';

const token = process.env.GITHUB_API_TOKEN || '';

export async function listUserRepos(login) {
  if (!token || !login) {
    return { ok: false, repos: [], notes: 'GITHUB_API_TOKEN or GitHub login is missing.' };
  }
  try {
    const response = await axios.get(`https://api.github.com/users/${login}/repos`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      },
      params: { per_page: 100, sort: 'updated' }
    });
    return {
      ok: true,
      repos: response.data.map((repo) => ({
        name: repo.name,
        private: repo.private,
        pushedAt: repo.pushed_at,
        language: repo.language
      })),
      notes: 'Repos loaded.'
    };
  } catch {
    return { ok: false, repos: [], notes: 'GitHub request failed.' };
  }
}

export function abilitiesFromRepos(repos) {
  const count = repos.length;
  const abilities = [];
  if (count >= 1) abilities.push('session');
  if (count >= 3) abilities.push('caste');
  if (count >= 5) abilities.push('bitchat');
  if (repos.some((repo) => repo.name === 'hexa-sigil-auth')) abilities.push('hexa');
  return {
    repoCount: count,
    abilities,
    note: 'Unlocks are a first pass. Not final.'
  };
}
