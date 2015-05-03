# node_vote
Simple direct voting system for fun. 
I made this simple system for my team's hackerthon and I hope your team have fun with this system.
If you want to introduce node.js to your team, this simple app would be nice for that purpose.

# Components
![image](https://cloud.githubusercontent.com/assets/5653885/7445148/9d23c718-f1e1-11e4-8907-5192515a35c6.png)


# Rest API
| uri                | method | description                        | request                                | response                               |
|--------------------|--------|------------------------------------|----------------------------------------|----------------------------------------|
| /votes             | get    | get a list of vote                 | see moongoose scheme  in server/app.js | see moongoose scheme  in server/app.js |
| /votes             | post   | make a new vote                    |                                        |                                        |
| /votes/:id         | get    | get an information of vote         |                                        |                                        |
| /votes/:id         | put    | update vote                        |                                        |                                        |
| /votes/:id         | delte  | delete vote                        |                                        |                                        |
| /voting_papers     | get    | get a voting paper list            |                                        |                                        |
| /voting_papers     | post   | make a new voting paper for a vote |                                        |                                        |
| /voting_papers/:id | get    | get an information of voting paper |                                        |                                        |
| /voting_papers/:id | put    | update voting paper                |                                        |                                        |
| /voting_papers/:id | delete | delete voting paper                |                                        |                                        |
| /users             | get    | get a list of users                |                                        |                                        |
| /users             | post   | make a new user                    |                                        |                                        |
| /users/:id         | get    | get an information of user         |                                        |                                        |
| /users/:id         | put    | update user                        |                                        |                                        |
| /users/:id         | delete | delete user                        |                                        |                                        |
| /current_vote      | post   | set current vote                   |                                        |                                        |
| /end_vote          | post   | end current vote                   |                                        |                                        |

# Install
    npm install
    
# Run Server
    node server/app.js
    
# Vote Page
    http://{url}/html/main/main.html

# Result Page (real time result)
    http://{url}/html/main/result.html
