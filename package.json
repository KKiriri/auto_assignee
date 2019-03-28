{
  "name": "auto-assignee",
  "version": "1.0.0",
  "description": "A Probot app",
  "author": "Weiwen Zhao <Weiwen.Zhao@ibm.com>",
  "license": "ISC",
  "repository": "https://github.com//auto-assignee.git",
  "homepage": "https://github.com//auto-assignee",
  "bugs": "https://github.com//auto-assignee/issues",
  "keywords": [
    "probot",
    "github",
    "probot-app"
  ],
  "scripts": {
    "dev": "nodemon",
    "start": "probot run ./index.js",
    "lint": "standard --fix",
    "test": "jest && standard",
    "test:watch": "jest --watch --notify --notifyMode=change --coverage"
  },
  "dependencies": {
    "probot": "^7.2.0",
    "probot-config": "^1.0.1",
    "probot-scheduler": "^1.2.0",
    "scramjet": "^4.22.2"
  },
  "devDependencies": {
    "jest": "^24.0.0",
    "nock": "^10.0.0",
    "nodemon": "^1.17.2",
    "smee-client": "^1.0.2",
    "standard": "^12.0.1"
  },
  "engines": {
    "node": ">= 8.3.0"
  },
  "standard": {
    "env": [
      "jest"
    ]
  },
  "nodemonConfig": {
    "exec": "npm start",
    "watch": [
      ".env",
      "."
    ]
  },
  "jest": {
    "testEnvironment": "node"
  }
}
