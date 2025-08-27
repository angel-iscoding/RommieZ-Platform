export default function isEmail (email) {
    for (const letter of email) {
        if (letter === "@") {
            return true
        }
    }
    return false
}