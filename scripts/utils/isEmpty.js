export default function isEmpty(object) {
    for (const key in object) {
        if (object[key].trim() === "") {
            return true    
        }
    }
    return false
}