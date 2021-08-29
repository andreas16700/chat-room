import path from 'path';
import fs from 'fs';
import { Logs } from './logs.js';
const __dirname = path.join(path.resolve(), "server");
const privateDir = path.join(__dirname, "private");
const rawdata = await fs.promises.readFile(path.resolve(privateDir, "nickNames.json"));
const nickNames = JSON.parse(rawdata.toString());
const nNickNames = nickNames.length;
let counter = 0;
export var Users;
(function (Users) {
    const users = [];
    async function assignUserName() {
        // choose a random user name fromt the samples given
        const chosenNickName = nickNames[counter % nickNames.length];
        counter += 1;
        if (counter < nNickNames)
            return chosenNickName;
        else
            return `chosenNickName${Math.floor(counter / nNickNames)}`;
    }
    const createUser = async (accessCode, mTurkId, id) => {
        const userName = await assignUserName();
        const newUser = {
            "user": {
                "name": userName,
                "mTurkId": mTurkId,
                "id": id,
            },
            "accessCode": accessCode
        };
        Logs.appendUser(accessCode, newUser);
        return newUser;
    };
    Users.userJoin = async (accessInfo, id) => {
        // Check if the user is already logged in with its details
        const user = getUserFromID(accessInfo?.user?.id);
        if (user) {
            console.log("Logging in user", user);
            return user;
        }
        let newUser = await createUser(accessInfo?.accessCode, accessInfo?.mTurkId, id);
        console.log("New user created", newUser);
        users.push(newUser);
        //console.log("Users:", users)
        return newUser;
    };
    function getUserFromID(id) {
        return users.find(user => id === user.user.id);
    }
    Users.getUserFromID = getUserFromID;
})(Users || (Users = {}));
//# sourceMappingURL=users.js.map