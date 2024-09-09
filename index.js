#!/usr/bin/env node

import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';
import gradient from 'gradient-string';
import { select, input, checkbox, password, confirm } from '@inquirer/prompts';
import nanospinner from 'nanospinner';
import simpleGit from 'simple-git';
import axios from 'axios';

async function fetchUserRepos(username) {
  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}/repos`
    );
    return response.data.map((repo) => repo.name);
  } catch (error) {
    console.error('Error fetching repositories:', error.message);
    return [];
  }
}

async function fetchAllRepos(token) {
  try {
    const response = await axios.get(`https://api.github.com/user/repos`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      params: {
        type: 'all',
        sort: 'full_name',
        per_page: 100,
      },
    });
    return response.data.map((repo) => ({
      name: repo.name,
      private: repo.private,
      clone_url: repo.clone_url,
    }));
  } catch (error) {
    console.error('Error fetching repositories:', error.message);
    return [];
  }
}

async function fetchOrgRepos(username, token) {
  try {
    const response = await axios.get(
      `https://api.github.com/orgs/${username}/repos`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
        params: {
          type: 'all',
          sort: 'full_name',
          per_page: 100, // Adjust if needed, max is 100 per page
        },
      }
    );
    return response.data.map((repo) => ({
      name: repo.name,
      private: repo.private,
      clone_url: repo.clone_url,
    }));
  } catch (error) {
    console.error('Error fetching repositories:', error.message);
    return [];
  }
}

async function gitAll() {
  const git = simpleGit();

  const platform = await select({
    type: 'list',
    name: 'platform',
    message: 'Select the platform',
    choices: [
      { name: 'Github', value: 'github' },
      { name: 'Bitbucket(Not available)', value: 'bitbucket', disabled: true },
    ],
    default: 'Github',
  });

  const repoType = await select({
    type: 'list',
    name: 'repoType',
    message: 'Select the repository type',
    choices: [
      { name: 'All repositories', value: 'all' },
      { name: 'Public repositories', value: 'public' },
      { name: 'Private repositories', value: 'private' },
    ],
  });

  const username = await input({
    type: 'input',
    name: 'username',
    message: 'Enter the GitHub username or organization name',
  });

  if (username === '' || username === null || username === undefined) {
    console.log(chalk.red('Username is required'));
    return;
  }

  let repos = [];
  let token;
  if (repoType === 'private' || repoType === 'all') {
    token = await password({
      type: 'password',
      name: 'token',
      message: 'Enter the PAT',
      mask: '*',
    });

    const isOrg = await confirm({
      type: 'confirm',
      name: 'isOrg',
      message: 'Download only org repositories?',
    });

    if (isOrg) {
      repos = await fetchOrgRepos(username, token);
    } else {
      repos = await fetchAllRepos(token);
    }
  } else {
    repos = await fetchUserRepos(username);
  }

  if (repos.length === 0) {
    console.log(chalk.red('No repositories found'));
    return;
  }

  if (repoType === 'private' || repoType === 'all') {
    const selectedRepos = await checkbox({
      type: 'checkbox',
      name: 'selectedRepos',
      message:
        'Select repositories to clone (use space to select, enter to confirm):',
      choices: [
        { name: 'All repositories', value: 'all' },
        ...repos.map((repo) => ({
          name: `${repo.name} ${repo.private ? '(Private)' : '(Public)'}`,
          value: repo.name,
        })),
      ],
    });

    const reposToClone = selectedRepos.includes('all') ? repos : selectedRepos;
    console.log('Total repositories to clone:', reposToClone.length);

    for (const repoName of reposToClone) {
      const spinner = nanospinner.createSpinner(`Cloning ${repoName}...`);
      spinner.start();
      const repo = repos.find((r) => r.name === repoName);
      if (!repo) continue;

      const repoUrl = repo.clone_url.replace('https://', `https://${token}@`);
      try {
        await git.clone(repoUrl, `./repos/${repo.name}`);
        spinner.success(`Successfully cloned ${repo.name}`);
      } catch (error) {
        spinner.error(`Failed to clone ${repo.name}: ${error.message}`);
      }
    }
    console.log(chalk.green('All repositories cloned successfully'));
    return;
  } else {
    const selectedRepos = await checkbox({
      type: 'checkbox',
      name: 'selectedRepos',
      message:
        'Select repositories to clone (use space to select, enter to confirm):',
      choices: [
        { name: 'All repositories', value: 'all' },
        ...repos.map((repo) => ({ name: repo, value: repo })),
      ],
    });

    const reposToClone = selectedRepos.includes('all') ? repos : selectedRepos;
    console.log('Total repositories to clone:', reposToClone.length);

    for (const repo of reposToClone) {
      const spinner = nanospinner.createSpinner(`Cloning ${repo}...`);
      spinner.start();
      const repoUrl = `https://github.com/${username}/${repo}.git`;
      try {
        await git.clone(repoUrl, `./repos/${repo}`);
        spinner.success(`Successfully cloned ${repo}`);
      } catch (error) {
        spinner.error(`Failed to clone ${repo}: ${error.message}`);
      }
    }
    console.log(chalk.green('All repositories cloned successfully'));
  }
}

await gitAll();
