# wowrack-be

## Installation Steps

1. Make sure you have MongoDB installed on your local machine. Please follow the instruction on how to [Install MongoDB Community Edition on macOS] if you haven't installed it.
2. Create an `.env` file on the root folder and copy the content of `.env.example` into it.
3. run `npm install`
4. In order to create the first super-administrator user in the application, run `npm run mongodb-seed`
5. Execute `npm run dev` command to run the server

[Install MongoDB Community Edition on macOS]: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/
