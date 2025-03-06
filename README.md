# PICXL

Self explanatory name, upload a screentshot of your shopping ticket and get a excel of it. 
Also if you are admin you can link your google drive account to store excels there.

![Preview 1](https://github.com/tempestgf/picxl/blob/main/images/Preview1.png)


![Preview 2](https://github.com/tempestgf/picxl/blob/main/images/Preview2.png)

## Setup

.env file must be like:

```env
#.env
NEXT_PUBLIC_GOOGLE_API_KEY=<YOUR API KEY>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<YOUR CLIENT API KEY>
DATABASE_URL="file:./dev.db"  
DOMAIN="https://yourdomain.com"
BETA_CODE="somefrikycode" # This is for addinmg restringed access to create a new account.
```

Then you need to run command to generate the database:

`npx prisma migrate dev --name init`

To develop:

`npm run dev`

To compile:

`npm run build` 

To server production (after running build):

`npm start`

## Demo

Demo at http://tomeacnic.hopto.org:8080

`user: test ; password: test`
