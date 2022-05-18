# Nylas

Handle emails for users on Chelsea Apps projects.

### Installation

The project is hosted on our private npm registry, so to install simply run

##### npm

```bash
npm i @chelseaapps/nylas
```

##### yarn

```bash
yarn add @chelseaapps/nylas
```

### Requirements

To be able to interact with the given endpoints valid `communicationToken` & `nylasAccountId`
values are needed

### Config

Import the module into the module in which you wish to register, and call the static `registerAsync` function.

#### Config options

| Option                         | Description                                                | Example                            |
| ------------------------------ | ---------------------------------------------------------- | ---------------------------------- |
| isGlobal                       | Register the module globally across all modules in the app | True                               |
| clientId                       | Client's ID                                                | 6c6wcj5j54qer74l72189ot2           |
| clientSecret                   | Secret key for authentication                              | RXIARTJAQWWNM3Q3QEXQ               |
| apiServer                      | Specify an alternative Nylas server                        | ireland.api.nylas.com              |
| authentication > redirectURI   | Redirect after connection                                  | `https://chelseaapps.com/callback` |
| authentication > defaultScopes | Default scopes to pass for all connections                 | [email.modify, email.read_only]    |
| encryption> key                | Encryption options                                         | 6c6wcj5j54qer74l72                 |

```typescript
import { Module } from '@nestjs/common';
import { NylasModule } from '@chelseaapps/nylas';

@Module({
	imports: [
        ... other imports here
        NylasModule.registerAsync({
			imports: [ConfigModule],
			inject: [HelperService, ConfigService],
			useClass: NylasConfig,
		}),
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
```

### Usage

| Methods           | Returns               | Description                         |
| ----------------- | --------------------- | ----------------------------------- |
| connect           | Promise `<string>`    | Generates an OAuth set up URL       |
| findThreadByID    | Promise `<Thread>`    | Return a Thread by its ID           |
| findThreadByIDs   | Promise `<Thread[]>`  | Returns List of Threads by its IDs  |
| searchThreads     | Promise `<Thread[]>`  | Returns Threads found               |
| send              | Promise `<Message>`   | Sends a message                     |
| findMessageByID   | Promise `<Message>`   | Returns a Message by its ID         |
| findMessagesByIDs | Promise `<Message[]>` | Returns List of Messages by its IDs |
| findMessagesByID  | Promise `<Message[]>` | Returns List of Messages by IDs     |
| searchMessages    | Promise `<Message[]>` | Returns Messages found              |
| deleteMessage     | Promise `<Message>`   | Deletes Message                     |
| createDraft       | Promise `<Draft>`     | Create a Draft                      |
| sendDraft         | Promise `<Draft>`     | Sends a Draft                       |
| updateDraft       | Promise `<Draft>`     | Updates a Draft                     |
| findDraftById     | Promise `<Draft>`     | Returns Drafts by Id                |
| findDraftByIds    | Promise `<Draft[]>`   | Returns List of Drafts by IDs       |
| deleteDraft       | Promise `<Draft>`     | Deletes a Draft                     |
| fileUpload        | Promise `<File>`      | Uploads a new File                  |
| fileDownload      | Promise `<any>`       | Downloads the File Object           |
| fileById          | Promise `<File>`      | Return a File                       |
| fileByIds         | Promise `<File[]>`    | Return a List of Files              |
| fileDelete        | Promise `<Boolean>`   | Deletes a File                      |
