# GitMagnet

**GitMagnet** is a powerful command-line tool that allows you to clone multiple GitHub repositories simultaneously. It supports cloning public repositories, private repositories, and organization repositories, making it an ideal solution for developers working with multiple projects or managing large codebases.

## Features

- Clone multiple GitHub repositories in one operation
- Support for public and private repositories
- Support for organization repositories
- Interactive command-line interface with user-friendly prompts
- Progress indicators for each repository being cloned
- Flexible repository selection (all, public, or private)
- Option to clone all repositories or select specific ones

## Usage

To use GitMagnet, run the following command:

```bash
npx gitmagnet
```

## How to use?
1. Run `npx gitmagnet`
2. Select the git provider
3. Select the repository type (public, private, or all)
4. Enter the username or organization name
5. Enter the PAT token (needed only if the repository type is private)
6. Wait for the repositories to be cloned

## Steps to create a PAT token
1. Go to [GitHub](https://github.com/)
2. Click on your profile picture on the top right corner
3. Click on "Settings"
4. Click on "Developer settings"
5. Click on "Personal access tokens"
6. Click on "Generate new token(classic)"
7. Enter the token name
8. Select the scopes
9. Click on "Generate token"
10. Copy the token
11. Paste the token in the prompt

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
gitmagnet
