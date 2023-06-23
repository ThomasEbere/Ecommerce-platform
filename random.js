const _= require ('lodash');
function createRandomString(length) {
    var chars = "abcdefghijklmnopqrstufwxyzABCDEFGHIJKLMNOPQRSTUFWXYZ1234567890"
    var pwd = _.sampleSize(chars, length || 12)  // lodash v4: use _.sampleSize
    return pwd.join("")
}
module.exports=createRandomString(16);