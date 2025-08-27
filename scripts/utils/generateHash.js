export default function generateSHA256(string) {
    return CryptoJS.SHA256(string).toString();
}